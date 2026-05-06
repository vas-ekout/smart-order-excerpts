import { MouseEvent, ReactNode, useState } from 'react';

import { useQuery } from '@connectrpc/connect-query';
import {
  Box,
  Divider,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMatch } from 'react-router';

import { Fab } from '@cubular/core';
import { Icon } from '@cubular/icons';

import { ReprocessingDeviceCard } from './ReprocessingDeviceCard';
import { SmartConnectRequired } from './SmartConnectRequired';
import { HygieneListDevice } from '../../api/proto/connectpb/shared_messages_pb';
import { DeviceService } from '../../api/proto/hygienepb/device_service_pb';
import { HygieneFlowType } from '../../api/proto/hygienepb/shared_messages_pb';
import { GlobalDrawerRight } from '../../components';
import { useReprocessingDevices } from '../../hooks';

const tabGroupPadding = 8;
const tabGroupRadius = 12;

const StyledToggleGroup = styled(ToggleButtonGroup)(({ theme }: { theme: Theme }) => ({
  position: 'relative',
  display: 'flex',
  backgroundColor: theme.palette.primary.lighter,
  width: '100%',
  height: 56,
  padding: tabGroupPadding,
  borderRadius: tabGroupRadius,
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }: { theme: Theme }) => ({
  border: 0,
  backgroundColor: 'transparent',
  width: '100%',
  color: theme.palette.primary.dark,
  padding: 6,
  zIndex: 1,
  '&.Mui-selected': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.darker,
  },
  '&.Mui-selected:hover': {
    backgroundColor: 'transparent',
  },
  '&:hover': {
    backgroundColor: 'transparent',
  },
  [theme.breakpoints.down(700)]: {
    padding: 2,
  },
}));

const Highlight = styled('span')(({ theme }: { theme: Theme }) => ({
  position: 'absolute',
  borderRadius: tabGroupRadius - 4,
  backgroundColor: theme.palette.background.default,
  zIndex: 0,
  transition: 'transform 0.3s ease',
}));

interface ReprocessingDeviceListProps {
  deviceItems: HygieneListDevice[];
  disabled?: boolean;
  open: boolean;
  onClose: () => void;
}

export const ReprocessingDeviceList = ({
  deviceItems,
  disabled,
  open,
  onClose,
}: ReprocessingDeviceListProps) => {
  const { t } = useTranslation();
  const { getHygieneFlowTypeIcon } = useReprocessingDevices();

  const { data } = useQuery(DeviceService.method.getDevices);
  const registeredDeviceList = data?.device;

  const deviceEditMatch = useMatch('/devices/:id');

  const deviceTypesFilter: { value: HygieneFlowType | 'ALL'; tabPosition: number }[] = [
    { value: 'ALL', tabPosition: 0 },
    { value: HygieneFlowType.HYGIENE_FLOW_PRECLEANING, tabPosition: 1 },
    { value: HygieneFlowType.HYGIENE_FLOW_DISINFECTION, tabPosition: 2 },
    { value: HygieneFlowType.HYGIENE_FLOW_SEALING, tabPosition: 3 },
    { value: HygieneFlowType.HYGIENE_FLOW_STERILISATION, tabPosition: 4 },
  ];

  const [selectedDeviceTypeFilter, setSelectedDeviceTypeFilter] = useState(deviceTypesFilter[0]);

  const tabOptions: { value: HygieneFlowType | 'ALL'; label: string; icon: ReactNode }[] = [
    {
      value: 'ALL',
      label: t('common.all'),
      icon: <Icon icon="layer-group" variant="solid" color="primary.main" size="l" />,
    },
    {
      value: HygieneFlowType.HYGIENE_FLOW_PRECLEANING,
      label: t('sections.reprocessingDevices.hygieneFlowTypes.cleansing'),
      icon: getHygieneFlowTypeIcon({
        type: HygieneFlowType.HYGIENE_FLOW_PRECLEANING,
        size: 'l',
      }),
    },
    {
      value: HygieneFlowType.HYGIENE_FLOW_DISINFECTION,
      label: t('sections.reprocessingDevices.hygieneFlowTypes.disinfection'),
      icon: getHygieneFlowTypeIcon({
        type: HygieneFlowType.HYGIENE_FLOW_DISINFECTION,
        size: 'l',
      }),
    },
    {
      value: HygieneFlowType.HYGIENE_FLOW_SEALING,
      label: t('sections.reprocessingDevices.hygieneFlowTypes.sealing'),
      icon: getHygieneFlowTypeIcon({ type: HygieneFlowType.HYGIENE_FLOW_SEALING, size: 'l' }),
    },
    {
      value: HygieneFlowType.HYGIENE_FLOW_STERILISATION,
      label: t('sections.reprocessingDevices.hygieneFlowTypes.sterilisation'),
      icon: getHygieneFlowTypeIcon({
        type: HygieneFlowType.HYGIENE_FLOW_STERILISATION,
        size: 'l',
      }),
    },
  ];

  const filteredDeviceItems = deviceItems
    .filter((item) => {
      return (
        selectedDeviceTypeFilter.value === 'ALL' || item.flowType === selectedDeviceTypeFilter.value
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleChange = (_event: MouseEvent<HTMLElement>, newIndex: number | null) => {
    if (newIndex !== null) {
      const newValue =
        deviceTypesFilter.find((item) => item.tabPosition === newIndex) || deviceTypesFilter[0];
      setSelectedDeviceTypeFilter(newValue);
    }
  };

  return (
    <GlobalDrawerRight open={open}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          minHeight: 68,
        }}
      >
        <Fab
          light
          shadow
          size="small"
          onClick={onClose}
          sx={{ flexShrink: 0 }}
          data-cy="reprocessingDevices-close-button"
        >
          <Icon color="primary.main" icon="x" size="m" variant="solid" />
        </Fab>
        <Typography variant="h5" sx={{ width: '100%' }} align="center">
          {t('sections.reprocessingDevices.label_other')}
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {disabled ? (
          <SmartConnectRequired />
        ) : (
          <>
            <StyledToggleGroup
              exclusive
              value={selectedDeviceTypeFilter.tabPosition}
              onChange={handleChange}
            >
              <Highlight
                style={{
                  transform: `translateX(${selectedDeviceTypeFilter.tabPosition * 100}%)`,
                  width: `calc((100% - ${tabGroupPadding * 2}px) / ${tabOptions.length})`,
                  height: `calc(100% - ${tabGroupPadding * 2}px)`,
                }}
              />
              {tabOptions.map((option, index) => (
                <Tooltip
                  key={option.value}
                  arrow
                  title={option.label}
                  slotProps={{
                    tooltip: { sx: { paddingInline: 1.5, bgcolor: 'primary.main', fontSize: 12 } },
                    arrow: { sx: { color: 'primary.main' } },
                  }}
                >
                  <StyledToggleButton disableRipple value={index}>
                    {option.icon}
                  </StyledToggleButton>
                </Tooltip>
              ))}
            </StyledToggleGroup>

            {filteredDeviceItems.map((item) => {
              const registeredDevice = registeredDeviceList?.find((d) => d.id === item.id);
              return (
                <ReprocessingDeviceCard
                  deviceIsOpen={
                    !!registeredDevice && deviceEditMatch?.params.id === registeredDevice.id
                  }
                  key={item.id}
                  registeredDeviceList={registeredDeviceList}
                  hygieneListDevice={item}
                  onAction={onClose}
                />
              );
            })}
          </>
        )}
      </Box>
    </GlobalDrawerRight>
  );
};
