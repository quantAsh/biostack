// This utility simulates fetching an asset from the user's device, like a photo from their camera roll.

export const getSimulatedPhotoOfTheDay = async (): Promise<{ description: string; base64: string }> => {
    // In a real app, this would use a file picker or native API. Here, we use a fixed URL.
    const imageUrl = 'https://storage.googleapis.com/gemini-ui-params/1b356073-a8c2-4217-9154-1b12078a94cb'; // A picture of a healthy salmon salad
    
    // We fetch the image and convert it to a base64 string to simulate reading a local file.
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error("Failed to read file as data URL."));
            }
            // We only need the base64 part of the data URL.
            const base64 = reader.result.split(',')[1];
            resolve({
                description: 'A photo of a salmon salad lunch.',
                base64
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
