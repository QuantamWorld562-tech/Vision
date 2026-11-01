function LandingBackground() {
  return (
    <div className="landing-background" aria-hidden="true">
      <div className="landing-background-spotlight" />
      <div className="landing-background-noise" />
      <svg className="landing-background-beams" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="landing-beam-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fb7185" stopOpacity="0" />
            <stop offset=".46" stopColor="#f87171" stopOpacity=".72" />
            <stop offset="1" stopColor="#fca5a5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="landing-beam-gradient-alt" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#7f1d1d" stopOpacity="0" />
            <stop offset=".5" stopColor="#fda4af" stopOpacity=".42" />
            <stop offset="1" stopColor="#7f1d1d" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="landing-beam landing-beam-one" d="M-120 760C180 580 280 180 730 110C1010 67 1170 170 1560 30" stroke="url(#landing-beam-gradient)" strokeWidth="1.5" />
        <path className="landing-beam landing-beam-two" d="M-80 920C240 690 360 360 770 250C1050 174 1240 280 1520 130" stroke="url(#landing-beam-gradient-alt)" />
        <path className="landing-beam landing-beam-three" d="M350 980C530 620 760 490 930 250C1050 80 1190 40 1510-30" stroke="url(#landing-beam-gradient)" />
        <path className="landing-beam landing-beam-four" d="M-40 280C270 390 450 250 670 40C780-60 980-40 1190 100" stroke="url(#landing-beam-gradient-alt)" />
      </svg>
      <span className="landing-signal landing-signal-one" />
      <span className="landing-signal landing-signal-two" />
      <span className="landing-signal landing-signal-three" />
      <span className="landing-signal landing-signal-four" />
    </div>
  );
}

export default LandingBackground;
