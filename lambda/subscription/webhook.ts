import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION,
});

export const stripeWebhook = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Verify webhook signature here in production
    const stripeEvent = JSON.parse(event.body || '{}');

    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook error' }),
    };
  }
};

async function handleCheckoutCompleted(session: any) {
  const { customer, metadata } = session;
  const { userId, planId } = metadata;

  await updateUserSubscription(userId, planId, 'active');
}

async function handleSubscriptionUpdated(subscription: any) {
  const customerId = subscription.customer;
  
  // Find user by Stripe customer ID
  const userId = await findUserByStripeCustomerId(customerId);
  if (!userId) return;

  const planId = determinePlanFromSubscription(subscription);
  const status = subscription.status === 'active' ? 'active' : 'past_due';

  await updateUserSubscription(userId, planId, status);
}

async function handleSubscriptionCancelled(subscription: any) {
  const customerId = subscription.customer;
  
  const userId = await findUserByStripeCustomerId(customerId);
  if (!userId) return;

  await updateUserSubscription(userId, 'free', 'cancelled');
}

async function handlePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer;
  
  const userId = await findUserByStripeCustomerId(customerId);
  if (!userId) return;

  // Update subscription status to active
  await cognito.adminUpdateUserAttributes({
    UserPoolId: process.env.COGNITO_USER_POOL_ID!,
    Username: userId,
    UserAttributes: [
      {
        Name: 'custom:subscription_status',
        Value: 'active',
      },
    ],
  }).promise();
}

async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer;
  
  const userId = await findUserByStripeCustomerId(customerId);
  if (!userId) return;

  // Update subscription status to past_due
  await cognito.adminUpdateUserAttributes({
    UserPoolId: process.env.COGNITO_USER_POOL_ID!,
    Username: userId,
    UserAttributes: [
      {
        Name: 'custom:subscription_status',
        Value: 'past_due',
      },
    ],
  }).promise();
}

async function updateUserSubscription(userId: string, planId: string, status: string) {
  const attributes = [
    {
      Name: 'custom:subscription_plan',
      Value: planId,
    },
    {
      Name: 'custom:subscription_status',
      Value: status,
    },
  ];

  // Set expiry date based on plan
  if (planId !== 'free') {
    const expiryDate = new Date();
    if (planId === 'premium') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (planId === 'enterprise') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    
    attributes.push({
      Name: 'custom:subscription_expires',
      Value: expiryDate.toISOString(),
    });
  }

  await cognito.adminUpdateUserAttributes({
    UserPoolId: process.env.COGNITO_USER_POOL_ID!,
    Username: userId,
    UserAttributes: attributes,
  }).promise();
}

async function findUserByStripeCustomerId(customerId: string): Promise<string | null> {
  // This is a simplified version - in production, you'd need to implement
  // a more efficient lookup, possibly using DynamoDB
  try {
    // You would need to implement a proper lookup mechanism here
    // For now, returning null
    return null;
  } catch (error) {
    console.error('Error finding user by Stripe customer ID:', error);
    return null;
  }
}

function determinePlanFromSubscription(subscription: any): string {
  // Determine plan based on subscription price ID
  const priceId = subscription.items.data[0]?.price?.id;
  
  if (priceId?.includes('premium')) return 'premium';
  if (priceId?.includes('enterprise')) return 'enterprise';
  
  return 'free';
}
