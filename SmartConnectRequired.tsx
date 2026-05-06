import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { Icon } from '@cubular/icons';

export const SmartConnectRequired = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 1.5,
        bgcolor: 'grey.200',
        p: 2,
        pt: 3,
        gap: 3,
        flexDirection: 'column',
      }}
    >
      <Icon icon="plug-circle-exclamation" size={50} variant="duotone" />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" marginBottom={0.5}>
          {t('sections.reprocessingDevices.smartConnectInactive')}
        </Typography>
        <Typography>{t('sections.reprocessingDevices.startSmartConnectAndReload')}</Typography>
      </Box>
      <Button variant="outlined" fullWidth onClick={() => window.location.reload()}>
        {t('sections.reprocessingDevices.startSmartConnect')}
      </Button>
    </Box>
  );
};
