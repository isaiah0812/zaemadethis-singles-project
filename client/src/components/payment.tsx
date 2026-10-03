import { useState, type ChangeEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutElementsProvider, useCheckoutElements, ContactDetailsElement, PaymentElement } from "@stripe/react-stripe-js/checkout";
import './styles/payment.css';

type PaymentProps = {
  close: () => any;
}

type PaymentState = 'selection' | 'loading' | 'checkout' | null;

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

export default function PaymentModal({ close }: PaymentProps) {
  const [ price, setPrice ] = useState<string>('0.00');
  const [ state, setState ] = useState<PaymentState>('selection');
  const [ clientSecret, setClientSecret ] = useState<string>('');

  const handleClose = (event: any) => {
    event.preventDefault();
    if (event.target === event.currentTarget) {

      close();
    }
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    let parsedValue = parseFloat(e.target.value);
    let parsedPrice = parseFloat(price);
    
    if (parsedValue !== 0 && parsedValue) {
      if (parsedValue >= parsedPrice && e.target.value.length > price.length) {
        setPrice((parsedValue * 10).toFixed(2));
      } else {
        setPrice((parsedValue / 10).toFixed(2))
      }
    } else if ((parsedValue === 0 || e.target.value.trim() === '') && parsedPrice !== 0) {
      setPrice('0.00');
    }
  };

  const handleSelection = () => {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const body = {
      price: Math.floor(parseFloat(price) * 100)
    };

    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
      credentials: 'include'
    };

    fetch('http://localhost:8080/payments/start-payment', options)
      .then(res => res.text())
      .then(data => {
        setClientSecret(data);
        setState('checkout');
      });
  };

  return(
    <div className="modal-overlay" onClick={handleClose}>
      {state === 'selection' && (
        <div className="modal">
          <h1>PAY WHAT YOU WANT</h1>
          <input id="price-input" type='number' placeholder="0.00" value={price} onChange={handlePriceChange} />
          <div className="button-group">
            <button className="button" onClick={() => {
              setState(null);
              close();
            }}>Cancel</button>
            <button className="button confirm" onClick={handleSelection}>Next</button>
          </div>
        </div>
      )}
      {state === 'checkout' && (
        <CheckoutElementsProvider
          stripe={stripePromise}
          options={{
            clientSecret,
            elementsOptions: {
              appearance: {
                theme: 'stripe'
              }
            }
          }}
        >
          <Checkout free={parseFloat(price) === 0} cancel={() => {
            setState(null);
            close();
          }} />
        </CheckoutElementsProvider>
      )}
    </div>
  )
}

type CheckoutProps = {
  cancel: () => any,
  free: boolean
}

type CheckoutStage = 'contact' | 'payment';

function Checkout({ cancel, free }: CheckoutProps) {
  const [ message, setMessage ] = useState<string | null>(null);
  const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);
  const [ stage, setStage ] = useState<CheckoutStage>('contact');

  const checkoutState = useCheckoutElements();

  if (checkoutState.type === 'loading') {
    return (
      <div>Loading...</div>
    )
  }

  if (checkoutState.type === 'error') {
    return (
      <div>Error: {checkoutState.error.message}</div>
    )
  }

  const handlePayment = async () => {
    console.log('Submitting!');

    const { checkout } = checkoutState;
    setIsSubmitting(true);

    

    const confirmResult = await checkout.confirm();

    if (confirmResult.type === 'error') {
      setMessage(confirmResult.error.message);
    }

    setIsSubmitting(false)
  }

  const validateContact = async () => {
    console.log('Checking!');
    const { validateElements } = checkoutState.checkout;

    const validation = await validateElements();

    if (validation.type === 'error') {
      setStage('contact');
    }

    if (validation.type === 'success') {
      setStage('payment');
    }
  }

  return (
    <form className="modal">
      <h4>Contact Details</h4>
      <ContactDetailsElement onBlur={validateContact} />
      {!free && stage === 'payment' && (
        <>
          <h4>Payment</h4>
          <PaymentElement id="payment-element" />
        </>
      )}
      <div className="button-group">
        <button className="button" onClick={cancel}>Cancel</button>
        <button className="button confirm" disabled={!checkoutState.checkout.canConfirm || isSubmitting} type="submit" onClick={handlePayment}>
          {isSubmitting ? (
            <div className="spinner"></div>
          ) : (
            `Pay ${checkoutState.checkout.total.total.amount} now`
          )}
        </button>
      </div>
    </form>
  );
}