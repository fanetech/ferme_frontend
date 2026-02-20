// components/AvePayLoader.jsx
import React from 'react';

const AvePayLoader = ({
                        size = 'medium',
                        showText = true,
                        className = '',
                        aveColor = '#ff6b35',
                        payColor = '#1e5ba8',
                        underlineColor = '#1e5ba8'
                      }) => {
  // Tailles prédéfinies
  const sizes = {
    small: {
      fontSize: '32px',
      height: '60px',
      width: '150px',
      underlineHeight: '3px'
    },
    medium: {
      fontSize: '48px',
      height: '80px',
      width: '200px',
      underlineHeight: '4px'
    },
    large: {
      fontSize: '64px',
      height: '100px',
      width: '250px',
      underlineHeight: '5px'
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <div className={`avepay-loader-container ${className}`}>
      <div className="avepay-loader" style={{ width: currentSize.width, height: currentSize.height }}>
        <div className="avepay-text" style={{ fontSize: currentSize.fontSize }}>
          <span className="ave" style={{ color: aveColor }}>Ave</span>
          <span className="pay" style={{ color: payColor }}>Pay</span>
          <div
            className="underline"
            style={{
              height: currentSize.underlineHeight,
              backgroundColor: underlineColor
            }}
          />
        </div>
      </div>

      {showText && (
        <div className="loading-text">
          <span>Chargement</span>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      )}

      <style jsx>{`
        .avepay-loader-container {
          text-align: center;
        }

        .avepay-loader {
          position: relative;
          margin: 0 auto;
        }

        .avepay-text {
          font-weight: bold;
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .ave, .pay {
          display: inline-block;
        }

        .underline {
          position: absolute;
          bottom: -10px;
          left: 0;
          border-radius: 2px;
          animation: underlineGrow 2s ease-in-out infinite;
        }

        .loading-text {
          color: #333;
          font-size: 18px;
          margin-top: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .loading-text span {
          display: inline-block;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .loading-text span:nth-child(1) { animation-delay: 0s; }
        .loading-text span:nth-child(2) { animation-delay: 0.1s; }
        .loading-text span:nth-child(3) { animation-delay: 0.2s; }
        .loading-text span:nth-child(4) { animation-delay: 0.3s; }

        @keyframes underlineGrow {
          0% {
            width: 0%;
            left: 0%;
          }
          50% {
            width: 100%;
            left: 0%;
          }
          100% {
            width: 0%;
            left: 100%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AvePayLoader;
