import { useMutation } from '@connectrpc/connect-query';
import { Box, Button, Card, IconButton, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Label } from '@cubular/core';
import { Icon } from '@cubular/icons';
import { protoTimestampToDayJs } from '@cubular/protos-and-dates';

import { HygieneListDevice } from '../../api/proto/connectpb/shared_messages_pb';
import { HygieneService } from '../../api/proto/hygienepb/hygiene_service_pb';
import { Device, ReprocessingStatus } from '../../api/proto/hygienepb/shared_messages_pb';
import { ReprocessingDeviceStatusLabel } from '../../components';
import { useReprocessingDevices } from '../../hooks';
import { PATHS, createPath } from '../../routes';

interface ReprocessingDeviceCardProps {
  deviceIsOpen?: boolean;
  hygieneListDevice: HygieneListDevice;
  registeredDeviceList?: Device[];
  onAction?: () => void;
}

export const ReprocessingDeviceCard = ({
  deviceIsOpen,
  hygieneListDevice,
  registeredDeviceList,
  onAction,
}: ReprocessingDeviceCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { palette } = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { getHygieneFlowTypeIcon, getReprocessingStatusValues } = useReprocessingDevices();
  const { color, label } = getReprocessingStatusValues(hygieneListDevice.lastReprocessing?.status);

  const registeredDevice = registeredDeviceList?.find(
    (device) => device.id === hygieneListDevice.id
  );

  const { mutate: createReprocessing, isPending: isCreating } = useMutation(
    HygieneService.method.createReprocessing,
    {
      onSuccess: (data) => {
        if (data?.reprocessing) {
          onAction?.();
          navigate(createPath(PATHS.hygieneManagement.reprocessing.edit, data.reprocessing.id), {
            replace: true,
          });
        }
      },
      onError: () => {
        enqueueSnackbar(t('common.error'), { variant: 'error' });
      },
    }
  );

  const handleStartNewProcess = () => {
    if (registeredDevice) {
      createReprocessing({
        flow: hygieneListDevice.flowType,
        deviceId: registeredDevice.id,
      });
    }
  };

  const handleOpenDeviceSettings = () => {
    if (registeredDevice) {
      onAction?.();
      navigate(createPath(PATHS.devices.edit, registeredDevice.id), {
        state: { tab: 'device-config' },
      });
    }
  };

  return (
    <Card
      sx={{
        width: '100%',
        p: 2,
        pt: 1,
        outlineWidth: deviceIsOpen ? 1.5 : 0,
        outlineStyle: 'solid',
        outlineColor: 'primary.main',
      }}
    >
      <ReprocessingDeviceStatusLabel
        reprocessingStatus={hygieneListDevice.lastReprocessing?.status}
      />
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          mt: 1,
          mb: 0.25,
          minHeight: 32,
        }}
      >
        {getHygieneFlowTypeIcon({
          type: hygieneListDevice.flowType,
          color: palette.grey[600],
          size: 'm',
        })}
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{hygieneListDevice.name}</Typography>
        <IconButton sx={{ ml: 'auto', marginRight: -1 }} onClick={handleOpenDeviceSettings}>
          <Icon icon="gear" size="m" variant="regular" />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, color: 'text.disabled' }}>
        <Typography sx={{ fontSize: 12 }}>{hygieneListDevice.serialNumber}</Typography>
        <Typography sx={{ fontSize: 12 }}>|</Typography>
        <Typography sx={{ fontSize: 12 }}>{hygieneListDevice.manufacturer}</Typography>
      </Box>
      {hygieneListDevice.lastReprocessing && (
        <Box
          sx={{
            width: '100%',
            mt: 1,
            px: 1.5,
            py: 1.2,
            border: `1px solid ${palette.grey[400]}`,
            borderRadius: 1,
            bgcolor: 'grey.200',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography fontSize={12} color="text.disabled">
              {hygieneListDevice.lastReprocessing?.id}
            </Typography>
            <Label color={color}>{label}</Label>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography fontSize={12} color="text.disabled">
              {protoTimestampToDayJs(hygieneListDevice.lastReprocessing?.createdAt)?.format(
                'DD.MM.YYYY HH:mm'
              )}
            </Typography>
            {hygieneListDevice.lastReprocessing?.finishedAt && (
              <>
                <Icon icon="right-long" variant="solid" color="text.disabled" size="s" />
                <Typography fontSize={12} color="text.disabled">
                  {protoTimestampToDayJs(hygieneListDevice.lastReprocessing.finishedAt)?.format(
                    'DD.MM.YYYY HH:mm'
                  )}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      )}

      {hygieneListDevice.lastReprocessing &&
          hygieneListDevice.lastReprocessing.status !== ReprocessingStatus.APPROVED &&
          hygieneListDevice.lastReprocessing.status !== ReprocessingStatus.REJECTED &&
          hygieneListDevice.lastReprocessing.status !== ReprocessingStatus.UNKNOWN && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'center' }}>
            <Button
              size="small"
              variant="contained"
              sx={{ width: '100%' }}
              onClick={() => {
                onAction?.();
                navigate(
                  createPath(
                    PATHS.hygieneManagement.reprocessing.edit,
                    hygieneListDevice.lastReprocessing!.id
                  )
                );
              }}
            >
              {t('hygiene.reprocessings.openReprocessing')}
            </Button>
          </Box>
        )}
        {(!hygieneListDevice.lastReprocessing ||
          hygieneListDevice.lastReprocessing.status === ReprocessingStatus.APPROVED ||
          hygieneListDevice.lastReprocessing.status === ReprocessingStatus.REJECTED ||
          hygieneListDevice.lastReprocessing.status === ReprocessingStatus.UNKNOWN) && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'center' }}>
            <Button
              size="small"
              variant="outlined"
              sx={{ width: '100%' }}
              onClick={handleStartNewProcess}
              disabled={isCreating}
            >
              {isCreating ? '...' : t('hygiene.reprocessings.startNewProcess')}
            </Button>
          </Box>
        )}
      </Card>
  );
};
