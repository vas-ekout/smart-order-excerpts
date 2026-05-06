import { useEffect, useState } from 'react';

import { useMutation, useQuery } from '@connectrpc/connect-query';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import { FormHeadline, HorizontalStack, VerticalStack } from '@cubular/form';

import { DeviceChecklistItem } from './DeviceChecklistItem';
import { DeviceChecklistItemForm } from './DeviceChecklistItemForm';
import { DeviceService } from '../../api/proto/hygienepb/device_service_pb';
import { ChecklistTemplateShort, Device } from '../../api/proto/hygienepb/shared_messages_pb';

interface DeviceChecklistsProps {
  device: Device;
}

export const DeviceChecklist = ({ device }: DeviceChecklistsProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { data: deviceChecklistData, refetch } = useQuery(DeviceService.method.getDeviceChecklist, {
    deviceId: device.id,
  });
  const deviceChecklist = deviceChecklistData?.checklist;
  const [items, setItems] = useState(deviceChecklist?.items ?? []);
  const [name, setName] = useState('');

  useEffect(() => {
    if (deviceChecklist?.items) {
      setItems(deviceChecklist.items);
    }
  }, [deviceChecklist?.items]);

  useEffect(() => {
    setName(deviceChecklist?.name || t('sections.devices.deviceChecklistFor') + ' ' + device.name);
  }, [deviceChecklist?.name, device.name, t]);

  // --- System templates ---
  const { data: templatesData, isPending: isLoadingTemplates } = useQuery(
    DeviceService.method.getChecklistTemplates,
    {},
    { enabled: !deviceChecklist?.id }
  );
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplateShort | null>(null);

  const { data: selectedTemplateData } = useQuery(
    DeviceService.method.getChecklistTemplateById,
    { id: selectedTemplate?.id ?? '' },
    { enabled: !!selectedTemplate?.id }
  );

  const { mutate: createDeviceChecklist, isPending: isCreating } = useMutation(
    DeviceService.method.createDeviceChecklist,
    {
      onSuccess: () => {
        refetch();
        enqueueSnackbar(t('sections.devices.checklistCreated'), { variant: 'success' });
      },
    }
  );

  const { mutate: updateDeviceChecklist } = useMutation(
    DeviceService.method.updateDeviceChecklist,
    {
      onSuccess: () => {
        refetch();
        enqueueSnackbar(t('sections.devices.checklistSaved'), { variant: 'success' });
      },
    }
  );

  const { mutate: setChecklistItemOrder } = useMutation(DeviceService.method.setChecklistItemOrder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !deviceChecklist?.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      setChecklistItemOrder({
        checklistId: deviceChecklist.id,
        itemIds: reordered.map((item) => item.id),
      });
      return reordered;
    });
  };

  const handleNameBlur = () => {
    if (!deviceChecklist?.id || name === deviceChecklist.name) return;
    updateDeviceChecklist({ checklistId: deviceChecklist.id, name });
  };

  const handleCreate = () => {
    const templateItems = selectedTemplateData?.template?.items;
    createDeviceChecklist({
      name,
      deviceId: device.id,
      ...(templateItems ? { items: templateItems } : {}),
    });
  };

  return (
    <>
      <Card sx={{ p: 2, pt: 4, pb: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FormHeadline sx={{ mb: 0 }}>{t('sections.devices.checklistData')}</FormHeadline>
        <VerticalStack spacing={2}>
          <HorizontalStack>
            <TextField
              fullWidth
              label={t('common.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
            />
          </HorizontalStack>
          {!deviceChecklist?.id && (
            <>
              <HorizontalStack>
                <Autocomplete
                  fullWidth
                  options={templatesData?.templates ?? []}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.itemCount} ${t('sections.devices.checklistItems')})`
                  }
                  value={selectedTemplate}
                  onChange={(_, value) => {
                    setSelectedTemplate(value);
                    if (value) setName(value.name);
                  }}
                  loading={isLoadingTemplates}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('sections.devices.fromTemplate')}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoadingTemplates ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </HorizontalStack>
              <HorizontalStack justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="medium"
                  sx={{ px: 4 }}
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {t('sections.devices.createDeviceChecklist')}
                </Button>
              </HorizontalStack>
            </>
          )}
        </VerticalStack>
      </Card>
      {deviceChecklist?.id && (
        <Card sx={{ mt: 4, p: 2, pt: 4, pb: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items && (
            <>
              <FormHeadline sx={{ mb: 0 }}>{t('sections.devices.checklistItems')}</FormHeadline>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {items.map((checklistItem, index) => (
                      <DeviceChecklistItem
                        key={checklistItem.id}
                        checklistItem={checklistItem}
                        index={index}
                        onMutationSuccess={refetch}
                      />
                    ))}
                  </Box>
                </SortableContext>
              </DndContext>
            </>
          )}
          <DeviceChecklistItemForm checklistId={deviceChecklist?.id} onSuccess={refetch} />
        </Card>
      )}
    </>
  );
};
