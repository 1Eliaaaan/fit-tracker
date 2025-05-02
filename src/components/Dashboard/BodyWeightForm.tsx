interface BodyWeightFormProps {
  bodyWeight: number | null;
  handleUpdateBodyWeight: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export default function BodyWeightForm({ bodyWeight, handleUpdateBodyWeight, isSubmitting }: BodyWeightFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
        Track Body Weight
      </h2>
      <form onSubmit={handleUpdateBodyWeight} className="space-y-4">
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Body Weight (kg)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="weight"
              id="weight"
              step="any"
              min="0"
              required
              defaultValue={bodyWeight || ''}
              placeholder="Enter your current weight in kg"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Update Body Weight'}
        </button>
      </form>
    </div>
  );
} 