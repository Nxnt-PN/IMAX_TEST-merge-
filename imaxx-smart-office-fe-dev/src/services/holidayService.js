
// Holidays
export async function getAllHolidays(queryParams) {
  try {
    const res = await globalThis.$axios.get("/api/holidays/", {
      params: queryParams,
    });
    return res.data;
  } catch (error) {
    console.log("Holidays Service Error: ", error);
    throw error;
  }
}
