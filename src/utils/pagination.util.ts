export const getPagination = (dto?: { page: string; limit: string }) => {
  const page = dto?.page || '1';
  const limit = dto?.limit || '10';
  const numberedPage = parseInt(page, 10);
  const numberedLimit = parseInt(limit, 10);

  if (isNaN(numberedPage) || numberedPage <= 0) {
    throw new Error(
      `Invalid page: "${page}". Page should be a positive integer.`,
    );
  }

  if (isNaN(numberedLimit) || numberedLimit <= 0) {
    throw new Error(
      `Invalid limit: "${limit}". Limit should be a positive integer.`,
    );
  }

  const skip = (numberedPage - 1) * numberedLimit;
  const take = numberedLimit;

  return { skip, take };
};
