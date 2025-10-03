import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import { extractArray } from '../utils/dataHelpers';

const inferMessages = (resourceLabel = {}) => {
  const { plural = 'registros' } = resourceLabel;
  return {
    fetchError: `Error al cargar ${plural}`,
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

const useArrayQuery = ({
  queryKey,
  queryFn,
  enabled = true,
  dataKey,
  fallbackKeys,
  transform,
  select,
  resourceLabel,
}) => {
  const messages = inferMessages(resourceLabel);

  const queryResult = useQuery(queryKey, queryFn, {
    enabled,
    select: select
      ? (data) => select(data)
      : (data) => extractArray(data, { dataKey, fallbackKeys, transform }),
    onError: (error) => {
      console.error(`useArrayQuery: fetch error for ${queryKey}`, error);
      toast.error(resolveErrorMessage(error, messages.fetchError));
    },
  });

  return {
    ...queryResult,
    items: queryResult.data ?? [],
  };
};

export default useArrayQuery;
