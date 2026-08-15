/**
 * 全局错误边界
 * 捕获渲染期错误，避免白屏，展示错误信息便于排查
 */

import { Component, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown): void {
    console.error('[ErrorBoundary] 捕获到错误:', error, info);
  }

  handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            gap: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
            应用出错了
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, wordBreak: 'break-all' }}>
            {this.state.error.message}
          </Typography>
          <Button variant="contained" onClick={this.handleReset}>
            点击恢复
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
