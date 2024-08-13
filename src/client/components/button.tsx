import { Box, CircularProgress } from '@mui/material';
import { FunctionComponent } from 'react';
import styles from './button.module.css';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  loading?: boolean;
}

const Button: FunctionComponent<ButtonProps> = ({
  onClick,
  children,
  disabled,
  style,
  loading = false,
  ...rest
}) => {
  return (
    <button
      className={`${styles.button} ${loading ? styles.buttonLoading : ''} `}
      style={style}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      <Box display="flex" alignItems="center">
        {loading && (
          <CircularProgress
            size={14}
            color="inherit"
            sx={{ marginRight: '8px' }}
          />
        )}{' '}
        {children}
      </Box>
    </button>
  );
};

export default Button;
