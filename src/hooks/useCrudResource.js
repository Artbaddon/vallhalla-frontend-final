import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';

const buildMessages = (resourceLabel = {}) => {
  const {
    singular = 'registro',
    plural = 'registros',
    custom = {},
  } = resourceLabel;

  return {
    fetchError: `Error al cargar ${plural}`,
    createSuccess: `${singular} creado exitosamente`,
    createError: `Error al crear ${singular}`,
    updateSuccess: `${singular} actualizado exitosamente`,
    updateError: `Error al actualizar ${singular}`,
    deleteSuccess: `${singular} eliminado exitosamente`,
    deleteError: `Error al eliminar ${singular}`,
    ...custom,
  };
};

const resolveErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  return (
    error.response?.data?.message ||
    error.message ||
    fallback
  );
};

export const useCrudResource = ({
  queryKey,
  fetcher,
  select,
  placeholderData = [],
  refetchOnWindowFocus = false,
  resourceLabel,
  createFn,
  updateFn,
  deleteFn,
  onFetchSuccess,
  onFetchError,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}) => {
  const messages = buildMessages(resourceLabel);
  const queryClient = useQueryClient();

  const queryResult = useQuery(queryKey, fetcher, {
    placeholderData,
    select,
    refetchOnWindowFocus,
    onSuccess: onFetchSuccess,
    onError: (error) => {
      console.error(`useCrudResource: fetch error for ${queryKey}`, error);
      toast.error(resolveErrorMessage(error, messages.fetchError));
      onFetchError?.(error);
    },
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries(queryKey);
  }, [queryClient, queryKey]);

  const createMutation = useMutation(createFn ?? (() => Promise.reject(new Error('createFn no definido'))), {
    onSuccess: (data, variables, context) => {
      toast.success(messages.createSuccess);
      invalidate();
      onCreateSuccess?.(data, variables, context);
    },
    onError: (error) => {
      console.error(`useCrudResource: create error for ${queryKey}`, error);
      toast.error(resolveErrorMessage(error, messages.createError));
    },
  });

  const updateMutation = useMutation(updateFn ?? (() => Promise.reject(new Error('updateFn no definido'))), {
    onSuccess: (data, variables, context) => {
      toast.success(messages.updateSuccess);
      invalidate();
      onUpdateSuccess?.(data, variables, context);
    },
    onError: (error) => {
      console.error(`useCrudResource: update error for ${queryKey}`, error);
      toast.error(resolveErrorMessage(error, messages.updateError));
    },
  });

  const deleteMutation = useMutation(deleteFn ?? (() => Promise.reject(new Error('deleteFn no definido'))), {
    onSuccess: (data, variables, context) => {
      toast.success(messages.deleteSuccess);
      invalidate();
      onDeleteSuccess?.(data, variables, context);
    },
    onError: (error) => {
      console.error(`useCrudResource: delete error for ${queryKey}`, error);
      toast.error(resolveErrorMessage(error, messages.deleteError));
    },
  });

  return {
    ...queryResult,
    items: queryResult.data ?? placeholderData,
    refetch: queryResult.refetch,
    mutations: {
      create: createMutation,
      update: updateMutation,
      delete: deleteMutation,
    },
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
  };
};

export default useCrudResource;
