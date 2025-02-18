export const fetchUniversities = async (): Promise<string[]> => {
    try {
      const response = await fetch("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
      if (!response.ok) {
        throw new Error("Failed to fetch university data");
      }
      const data = await response.json();
      
      // Extract and return the university names
      return data.map((university: { name: string }) => university.name);
    } catch (error) {
      console.error("Error fetching universities:", error);
      return [];
    }
  };
  