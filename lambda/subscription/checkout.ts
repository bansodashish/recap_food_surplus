import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION,
});

export const createCheckoutSession = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { priceId, userId, planId, billingCycle, successUrl, cancelUrl } = JSON.parse(
      event.body || '{}'
    );

    // Get user from Cognito
    const userData = await cognito.adminGetUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: userId,
    }).promise();

    const email = userData.UserAttributes?.find(attr => attr.Name === 'email')?.Value;

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User email not found' }),
      };
    }

    // Create or get Stripe customer
    let customer;
    const existingCustomer = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomer.data.length > 0) {
      customer = existingCustomer.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          cognitoUserId: userId,
          planId: planId,
        },
      });

      // Update Cognito with Stripe customer ID
      await cognito.adminUpdateUserAttributes({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: userId,
        UserAttributes: [
          {
            Name: 'custom:stripe_customer_id',
            Value: customer.id,
          },
        ],
      }).promise();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
        billingCycle,
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
  }
};

export const createPortalSession = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { userId, returnUrl } = JSON.parse(event.body || '{}');

    // Get user's Stripe customer ID from Cognito
    const userData = await cognito.adminGetUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: userId,
    }).promise();

    const stripeCustomerId = userData.UserAttributes?.find(
      attr => attr.Name === 'custom:stripe_customer_id'
    )?.Value;

    if (!stripeCustomerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No subscription found' }),
      };
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Error creating portal session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create portal session' }),
    };
  }
};
