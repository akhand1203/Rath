import React from 'react'

const LocationSearchPanel = (props) => {

  // Use suggestions from props, fallback to empty array
  const locations = props.suggestions && props.suggestions.length > 0 ? props.suggestions : [];
  const { loading = false } = props;

  return (
    <div className='flex flex-col gap-2 max-h-96 overflow-y-auto'>
      {loading ? (
        <div className='flex justify-center items-center py-8'>
          <div className='w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin'></div>
        </div>
      ) : locations.length > 0 ? (
        locations.map(function (location, index) {
          return (
            <div 
              key={location.id || index} 
              onClick={() => {
                props.onSelectLocation(location);
              }}
              className='flex items-start gap-4 p-3 active:bg-gray-200 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors'
            >
              <div className='shrink-0 text-xl text-gray-700 mt-1'>
                <i className="ri-map-pin-2-fill"></i>
              </div>
              <div className='grow min-w-0'>
                <h4 className='text-sm font-medium text-gray-900 line-clamp-2'>{location.displayName}</h4>
              </div>
            </div>
          )
        })
      ) : (
        <div className='text-sm text-gray-500 p-3 text-center'>
          Type at least 3 characters to see suggestions...
        </div>
      )}
    </div>
  )
}
export default LocationSearchPanel