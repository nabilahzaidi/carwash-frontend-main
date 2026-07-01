import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const StartnEndTimeConverter = (d: any) => {
  const value = d?.$d ?? d;

  if (value === null || value === undefined || value === '') {
    return { time: '' };
  }

  const dayjsObject = dayjs(value, ['HH:mm', 'HH:mm:ss', 'h:mm A'], true);
  const time = dayjsObject.isValid()
    ? dayjsObject.format('HH:mm')
    : dayjs(value).isValid()
      ? dayjs(value).format('HH:mm')
      : String(value).slice(0, 5);

  return { time };
};

export default StartnEndTimeConverter;