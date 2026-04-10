import React from 'react';

const AppLoader = ({
                        size = 'medium',
                        showText = true,
                        className = '',
                      }) => {
  const sizes = {
    small: {
      fontSize: '28px',
      height: '60px',
      width: '150px',
      underlineHeight: '3px'
    },
    medium: {
      fontSize: '40px',
      height: '80px',
      width: '200px',
      underlineHeight: '4px'
    },
    large: {
      fontSize: '52px',
      height: '100px',
      width: '250px',
      underlineHeight: '5px'
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <div className={`app-loader-container ${className}`}>
      <div className="app-loader" style={{ width: currentSize.width, height: currentSize.height }}>
        <div className="app-loader-text" style={{ fontSize: currentSize.fontSize }}>
          <span className="farm-icon">🌾</span>
          <span className="farm-text" style={{ color: '#16a34a' }}>Farm</span>
          <div
            className="underline"
            style={{
              height: currentSize.underlineHeight,
              backgroundColor: '#16a34a'
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
        .app-loader-container {
          text-align: center;
        }

        .app-loader {
          position: relative;
          margin: 0 auto;
        }

        .app-loader-text {
          font-weight: bold;
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .farm-icon {
          display: inline-block;
          margin-right: 4px;
        }

        .farm-text {
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

export default AppLoader;
