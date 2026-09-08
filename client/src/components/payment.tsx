import { useState, type ChangeEvent } from "react";
import './styles/payment.css';

type PaymentProps = {
  close: () => any;
  onSuccess: () => any;
}

type PaymentState = 'selection' | 'checkout' | null;

export default function PaymentSelection({ close, onSuccess }: PaymentProps) {
  const [ price, setPrice ] = useState<string>('0.00');
  const [ state, setState ] = useState<PaymentState>('selection');

  const handleClose = (event: any) => {
    event.preventDefault();
    if (event.target === event.currentTarget) {

      close();
    }
  }

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    let parsedValue = parseFloat(e.target.value);
    let parsedPrice = parseFloat(price);
    
    if (parsedValue !== 0 && parsedValue) {
      if (parsedValue > parsedPrice) {
        setPrice((parsedValue * 10).toString());
      } else {
        setPrice((parsedValue / 10).toString())
      }
    } else if ((parsedValue === 0 || e.target.value.trim() === '') && parsedPrice !== 0) {
      setPrice('0.00');
    }
  }

  const handlePayment = () => {
    // TODO send price to payment screen

    setState(null);
    close();
    onSuccess();
  }

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
          <button style={{backgroundColor: 'blue'}} onClick={() => setState('checkout')}>Next</button>
          <button style={{backgroundColor: 'red'}} onClick={() => {
            setState(null);
            close();
          }}>Cancel</button>
        </div>
      )}
      {state === 'checkout' && (
        <div className="payment-checkout-modal">
          Hey there!
          <button style={{backgroundColor: 'blue'}} onClick={handlePayment}>Next</button>
          <button style={{backgroundColor: 'red'}} onClick={() => {
            setState(null);
            close();
          }}>Cancel</button>
        </div>
      )}
    </div>
  )
}