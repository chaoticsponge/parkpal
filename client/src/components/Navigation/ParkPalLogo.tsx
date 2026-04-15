const ParkPalLogo = () => {
  return (
    <svg
      viewBox="0 0 260 84"
      role="img"
      aria-label="ParkPal"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="7" y="7" width="70" height="70" rx="18" fill="#d9e2ff" stroke="#111111" strokeWidth="5" />
      <rect x="29" y="16" width="26" height="52" rx="13" fill="#f35498" />
      <rect x="24" y="26" width="36" height="10" rx="5" fill="#34358d" />
      <rect x="24" y="50" width="36" height="10" rx="5" fill="#34358d" />
      <rect x="22" y="28" width="4" height="12" rx="2" fill="#f35498" />
      <rect x="58" y="28" width="4" height="12" rx="2" fill="#f35498" />
      <text
        x="96"
        y="52"
        fontFamily="Inter, sans-serif"
        fontSize="32"
        fontWeight="800"
        letterSpacing="0.5"
      >
        <tspan fill="#f35498">PARK</tspan>
        <tspan fill="#34358d">PAL</tspan>
      </text>
    </svg>
  );
};

export default ParkPalLogo;
