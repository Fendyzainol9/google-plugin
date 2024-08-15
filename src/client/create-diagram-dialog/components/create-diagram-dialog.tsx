import { useEffect, useState } from 'react';
import { buildUrl, handleDialogClose } from '../../utils/helpers';
import { serverFunctions } from '../../utils/serverFunctions';
import useAuth from '../../hooks/useAuth';
import { CircularProgress, Container, Typography } from '@mui/material';
import { showAlertDialog } from '../../utils/alert';

const CreateDiagramDialog = () => {
  const { authState, authStatus } = useAuth();
  const [diagramsUrl, setDiagramsUrl] = useState('');

  useEffect(() => {
    if (!authState?.authorized) return;
    const url = buildUrl(
      '/app/diagrams/new?pluginSource=googledocs',
      authState.token
    );
    setDiagramsUrl(url);
  }, [authState]);

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      const action = e.data.action;
      if (action === 'save') {
        const data = e.data.data;
        const metadata = new URLSearchParams({
          projectID: data.projectID,
          documentID: data.documentID,
          major: data.major,
          minor: data.minor,
        });

        try {
          await serverFunctions.insertBase64ImageWithMetadata(
            data.diagramImage,
            metadata.toString()
          );
          handleDialogClose();
        } catch (error) {
          console.error('Error inserting image with metadata', error);
          showAlertDialog('Error inserting image, please try again');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (authStatus === 'idle' || authStatus === 'loading') {
    return (
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '96.5vh',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (authStatus === 'error') {
    return (
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '96.5vh',
        }}
      >
        <Typography variant="h5" gutterBottom my={2} textAlign="center">
          Error
        </Typography>
        <Typography paragraph textAlign="center">
          Something went wrong. Please try again later.
        </Typography>
      </Container>
    );
  }

  return (
    <div style={{ padding: '3px', overflowX: 'hidden', height: '100%' }}>
      <iframe
        src={diagramsUrl}
        title="diagrams"
        style={{
          border: 'none',
          width: '100%',
          height: '96.5vh',
        }}
      />
    </div>
  );
};

export default CreateDiagramDialog;
