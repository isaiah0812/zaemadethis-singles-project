import { useState, type ChangeEvent, type FormEvent } from "react";
import './styles/payment.css';
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutElementsProvider, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import { ContactDetailsElement, PaymentElement } from "@stripe/react-stripe-js";

type PaymentProps = {
  close: () => any;
  onSuccess: () => any;
}

type PaymentState = 'selection' | 'loading' | 'checkout' | null;

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

export default function PaymentModal({ close, onSuccess }: PaymentProps) {
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
      price: parseFloat(price) * 100
    };

    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    };

    fetch('http://localhost:8080/payments/start-payment', options)
      .then(res => res.text())
      .then(data => {
        setClientSecret(data);
        setState('checkout');
      });
  };

  const handlePayment = () => {
    // TODO send price to payment screen

    setState(null);
    close();
    onSuccess();
  };

  return(
    <div className="modal-overlay" onClick={handleClose}>
      {state === 'selection' && (
        <div className="payment-selection-modal">
          <h3>Pay What You Want!</h3>
          <p>I really don't care if you pay anything at all. It's free.
            But, if you're feeling like this shouldn't be free, let the
            intrusive thoughts win this time, enter an amount below,
            then click "Next".</p>
          <input type='number' placeholder="0.00" value={price} onChange={handlePriceChange} />
          <button style={{backgroundColor: 'blue'}} onClick={handleSelection}>Next</button>
          <button style={{backgroundColor: 'red'}} onClick={() => {
            setState(null);
            close();
          }}>Cancel</button>
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
          <Checkout price={price} success={handlePayment} cancel={() => {
            setState(null);
            close();
          }} />
        </CheckoutElementsProvider>
      )}
    </div>
  )
}

type CheckoutProps = {
  price: string,
  success: () => any,
  cancel: () => any
}

function Checkout({ price, success, cancel }: CheckoutProps) {
  const [ message, setMessage ] = useState<string | null>(null);
  const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);

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

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    const { checkout } = checkoutState;
    setIsSubmitting(true);

    const confirmResult = await checkout.confirm();

    if (confirmResult.type === 'error') {
      setMessage(confirmResult.error.message);
    }

    setIsSubmitting(false)

    if (confirmResult.type === 'success') {
      success();
    }
  }

  return (
    <form className="payment-checkout-modal" onSubmit={handlePayment}>
      Hey there! Your price is {checkoutState.checkout.total.total.amount}.
      {/* <h4>Contact Details</h4>
      <ContactDetailsElement />
      <h4>Payment</h4>
      <PaymentElement id="payment-element" /> */}
      <button style={{backgroundColor: 'blue'}} disabled={!checkoutState.checkout.canConfirm || isSubmitting} type="submit">
        {isSubmitting ? (
          <div className="spinner"></div>
        ) : (
          `Pay ${checkoutState.checkout.total.total.amount} now`
        )}
      </button>
      <button style={{backgroundColor: 'red'}} onClick={cancel}>Cancel</button>
    </form>
  );
}