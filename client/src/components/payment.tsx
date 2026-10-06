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
                disableAnimations: true,
                theme: 'stripe',
                variables: {
                  colorText: '#ffffff'
                },
                rules: {
                  '.Input': {
                    border: '0.25rem solid #ffffff',
                    borderRadius: '0.15rem',
                    backgroundColor: 'transparent'
                  },
                  '.Input:focus': {
                    borderColor: '#ffffff',
                  },
                  '.Input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)'
                  },
                  '.Tab': {
                    backgroundColor: 'transparent',
                    borderRadius: '0.15rem',
                    border: '0.25rem solid #ffffff',
                    color: '#ffffff',
                    boxShadow: '-0.25rem 0.25rem 1px #4e4e4e'
                  },
                  '.Tab:focus': {
                    boxShadow: '#0f90cc',
                  },
                  '.Tab--selected:focus': {
                    borderColor: '#0f90cc',
                    boxShadow: '-0.25rem 0.25rem 1px #4e4e4e'
                  },
                  '.Tab--selected': {
                    borderColor: '#0f90cc',
                    boxShadow: '-0.25rem 0.25rem 1px #4e4e4e',
                    transform: 'none',
                  },
                  '.Tab:active': {
                    borderColor: '#0f90cc',
                    boxShadow: 'none',
                    tranform: 'translate(-0.25rem, 0.25rem)',
                    animation: 'none'
                  },
                  '.TabIcon': {
                    fill: '#ffffff'
                  },
                  '.TabIcon--selected': {
                    fill: '#0f90cc'
                  },
                  '.TabLabel--selected': {
                    color: '#0f90cc'
                  },
                  '.CheckboxInput--checked': {
                    backgroundColor: '#0f90cc',
                    borderColor: '#0f90cc'
                  },
                  '.Block': {
                    backgroundColor: 'transparent',
                    border: '0.25rem solid #ffffff',
                    borderRadius: '0.15rem'
                  },
                  '.PickerItem': {
                    backgroundColor: 'transparent',
                    border: '0.25rem solid #ffffff',
                    borderRadius: '0.15rem'
                  }
                  // TODO change hover settings on picker item
                }
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

function Checkout({ cancel, free }: CheckoutProps) {
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

  const handlePayment = async () => {
    console.log('Submitting!');

    const { checkout } = checkoutState;
    setIsSubmitting(true);

    

    const confirmResult = await checkout.confirm();

    if (confirmResult.type === 'error') {
      console.error(confirmResult.error.message);
    }

    setIsSubmitting(false)
  }

  return (
    <form className="modal">
      <h4>Contact Details</h4>
      <ContactDetailsElement />
      {!free && (
        <>
          <h4>Payment</h4>
          <PaymentElement id="payment-element" options={{ layout: { type: 'tabs', defaultCollapsed: true } }} />
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