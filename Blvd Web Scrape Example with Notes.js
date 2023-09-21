//This code makes sense in the context of onboarding new clients via a data migration as we would be hitting an API to collect, for example, client data in their current CRM platform and would know exactly what properties the data has and how to extract them. 


//async function allows us to asynchronously run a function and continue the execution of code. incorporating an async function in this case allows for the code to be more readable by not having to maintain a promise chain(using .then over and over and then using .catch for error handling at the very end). I could infer that, at a large scale such as in data migrations, asynchronous code is crucial because it allows one to incrementally process/transform data while not causing significant performance issues across the entire platform.
const fetchDataByID = async (identifier: string): Promise<any> => {  //fetchDataByID is being assigned to the value identifier, which is the type syntax for variable declaration in TypeScript     
//async function with a string parameter called identifier. Will return a promise regardless of type

  const result = await school.fetchData( //school is some sort of library that I can't find anywhere. Maybe an internal library at Boulevard. But fetchData appears similar to the fetch function that gets data like an API call
  //await keyword means code waits for response before continuing to execute in a sequential manner
    {
      endpoint: school.ENDPOINTS.DATA, //most likely an API endpoint that accepts requests and sends back responses
      method: 'GET', //HTTP GET request to get data
      parameters: {
        id: identifier,
      },
    },
    false
  )

  if (result === null) { //this is to check if the data retrieved from the API is null. Most likely in a situation where the request fails or no data is returned
    school.logger.error(`Failed to retrieve details for identifier ${identifier}`)
    return []
  }

  const { responseData } = result as Record<'responseData', string> //extracting responseData from result object and assigning it to variable also called responseData
  //destructuring to get the responseData value from result object
  //defining object type with a single property named 'responseData' of type string

  const {
    window: { document },
  } = new JSDOM(responseData) //JSDOM documentation here https://github.com/jsdom/jsdom 
  //seems to allow external manipulation of the DOM that is unique from other DOM APIs, but syntax is throwing me off a bit from the basic example the docs use

  if ( //another error checker, this time instead of the connection with the API it's the DOM itself. if conditional is true (search function evaluates to -1 if the index of a matching string is not found) it populates and returns an object with default values
    document.body.innerHTML.search("Oops! Something went wrong") !== 
    -1
  ) {
    return {
      id: identifier,
      firstName: 'Unknown',
      lastName: '',
      isActive: false,
    } as PartialData
  }

  const identifiers = Array.from( //assigning identifiers to the array generated from document.querySelectorAll
    document.querySelectorAll('#dropdown option[selected="selected"]') //array only collects elements that are selected in a dropdown menu
  )
    .map((item) => _.get(item, 'value')) //iterate over each element and retrieve the 'value' value using imported lodash(https://lodash.com/) library function 'get'
    .filter((value) => value !== '0')//filter the array created from .map array function to remove any values that strictly equal '0'. Now we are left with an array of non-zero identifiers

  const data = {
    id: identifier, //unique ID for all the data we initially fetched
    selectedIdentifiers: identifiers.length === 0 ? ['1'] : identifiers, //if the array we previously made is empty, assign an array with just the element '1'. Otherwise, assign it to the identifiers array
    firstName: _.get(document.querySelector('#firstField'), 'value'),//extracting value of element with 'firstField' ID 'value' attribute
    lastName: _.get(document.querySelector('#lastField'), 'value'), //extracting value of element with 'lastField' ID 'value' attribute
    emailAddress: _.get(document.querySelector('#emailField'), 'value'), //extracting value of element with 'emailField' ID 'value' attribute
    role: _.get(document.querySelector('.roleField'), 'textContent'), //extracting value of element with 'roleField' class 'textContent' attribute
    isActive: _.get(document.querySelector('#isActiveField'), 'value') === 'True', //extracting value of element with 'isActiveField' ID 'value' attribute, then comparing to the string 'True' presumably to get an actual boolean value for the isActive property
    phone: _.get(document.querySelector('#phoneField'), 'value'), //extracts value from element with 'phoneField' ID 'value' attribute. Probably a phone number
  } as PartialData

  return data //this object holds data, most likely for a single person or user.
}