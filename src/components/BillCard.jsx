import { BILL_IMAGES } from '../billImages.js';

export default function BillCard({ denom, qty, prefix, onChangeQty }) {
  const imgSrc = BILL_IMAGES[denom.img];
  const label  = denom.label + (prefix === 'l' ? ' LL' : '');

  return (
    <div className={`bill-card${qty > 0 ? ' active' : ''}`}>
      <div className="bill-img">
        <img src={imgSrc} alt={label} />
      </div>
      <div className="bill-denom">{label}</div>
      <div className="bill-qty">
        <div className="qbtn" onClick={e => { e.stopPropagation(); onChangeQty(denom.val, -1); }}>−</div>
        <div className={`qnum${qty > 0 ? ' has' : ''}`}>{qty}</div>
        <div className="qbtn" onClick={e => { e.stopPropagation(); onChangeQty(denom.val, 1); }}>+</div>
      </div>
    </div>
  );
}
