import { useState, type ChangeEvent, type FocusEvent, type MouseEvent } from "react";

type PaymentProps = {
  close: () => any;
  onSuccess: () => any;
}

export default function PaymentSelection({ close, onSuccess }: PaymentProps) {
  const [ price, setPrice ] = useState<string>('0.00');
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

    close();
    onSuccess();
  }
  return(
    <div style={{
      width: '100vw',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      height: '100vh',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }} onClick={handleClose}>
      <div style={{
        width: '100%',
        maxWidth: '750px',
        height: '11rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        color: 'black',
        zIndex: 2,
        borderRadius: '1rem',
        padding: '2rem',
        flexDirection: 'column',
        gap: '0.25rem',
      }}>
        <h3>Pay What You Want!</h3>
        <p>I really don't care if you pay anything at all, it's free.
          But, if you're feeling like this shouldn't be free, let the
          intrusive thoughts win this time, enter an amount below,
          then click "Next".</p>
        <input type='number' placeholder="0.00" value={price} onChange={handlePriceChange} />
        <button style={{backgroundColor: 'blue'}} onClick={handlePayment}>Next</button>
        <button style={{backgroundColor: 'red'}} onClick={close}>Cancel</button>
      </div>
    </div>
  )
}