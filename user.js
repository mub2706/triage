
document.addEventListener('DOMContentLoaded', function() {
  updateDatetime(); // Update datetime when the page loads
  setInterval(updateDatetime, 1000); // Update every second

  fetchAverageWaitTime();
});

function updateDatetime() {
    var datetimeElement = document.getElementById('datetime');
    var now = new Date();
    var datetimeString = now.toLocaleString();
    datetimeElement.textContent = datetimeString;
}

function fetchAverageWaitTime() {
  // Fetch average wait time for the current day
  fetch('/average-wait-time')
    .then(response => response.json())
    .then(data => {
      // Check if the element exists in the DOM
      const averageWaitTimeElement = document.getElementById('averageWaitTime');
      if (averageWaitTimeElement) {
        // Update the average wait time div
        averageWaitTimeElement.textContent = data.averageWaitTime;
      } else {
        console.error('Element with id "averageWaitTime" not found in the DOM');
      }
    })
    .catch(error => {
      console.error('Error fetching average wait time:', error);
    });
}

// Fetch injury_types from the database
fetch('/injury-types')
  .then(response => response.json())
  .then(injuryTypes => {
    // Get the select element
    const selectInjuryType = document.getElementById('injuryTypes');

    // Iterate through the injury types and create options
    injuryTypes.forEach(level => {
      const option = document.createElement('option');
      option.value = level.injury_type;
      option.text = level.injury_desc;
      selectInjuryType.appendChild(option);
    });
  })
  .catch(error => {
    console.error('Error fetching urgency levels:', error);
  });

// Fetch urgency levels from the database
fetch('/urgency-levels')
  .then(response => response.json())
  .then(urgencyLevels => {
    // Get the select element
    const selectUrgencyLevel = document.getElementById('urgencyLevel');

    // Iterate through the urgency levels and create options
    urgencyLevels.forEach(level => {
      const option = document.createElement('option');
      option.value = level.urgency_level;
      option.text = `${level.urgency_level_desc} - ${level.default_wait_time} mins`;
      selectUrgencyLevel.appendChild(option);
    });
  })
  .catch(error => {
    console.error('Error fetching urgency levels:', error);
  });

//Function to save the user information to a database
async function submitForm() {
  // Get values from the form
  var name = document.getElementById('name').value;
  var age = document.getElementById('age').value;
  var injuryType = document.getElementById('injuryTypes').value;
  var urgencyLevel = document.getElementById('urgencyLevel').value;
  var info = document.getElementById('info').value;

  // Validate fields
  if (injuryType === '0' || urgencyLevel === '0') {
    alert('Please select a valid injury and urgency level.');
    return;
  }

  // Validate age
  if (!isValidAge(age)) {
    alert('Please enter a valid age.');
    return;
  }

  try {
    // Fetch default_wait_time based on the selected urgencyLevel
    const responseWaitTime = await fetch(`/urgency-levels/${urgencyLevel}`);
    
    // Log the response from the server
    console.log('Response from /urgency-levels:', responseWaitTime);

    // Check if the response is successful
    if (!responseWaitTime.ok) {
      console.error('Error fetching default wait time:', responseWaitTime.statusText);
      throw new Error('Failed to fetch default wait time');
    }

    const waitTimeResult = await responseWaitTime.json();
    const defaultWaitTime = waitTimeResult.default_wait_time;

    // Make a POST request to the server
    const response = await fetch('/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        age,
        injuryType,
        urgencyLevel,
        defaultWaitTime,
        info,
      }),
    });

    // Check if the request was successful (status code 200)
    if (response.ok) {
      // Parse the response JSON
      const result = await response.json();

      // Access the new patient_id from the response
      const newPatientId = result.newPatientId;

      // Use the new patient_id as needed
      console.log('New patient_id:', newPatientId);
      // Access the new patient_id and name from the response
      const patientName = name;

      // Display an alert with patient ID, name, and default_wait_time
      alert(`Patient ID: ${newPatientId}\nPatient Name: ${patientName}\nDefault Wait Time: ${defaultWaitTime}\nSuccessfully Created.`);
    } else {
      // Handle the error
      console.error('Error submitting form:', response.statusText);
      alert('Failed to submit form. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('An unexpected error occurred. Please try again.');
  }
}

// Function to validate age as a positive integer
function isValidAge(age) {
  // Check if age is a positive integer
  return /^\d+$/.test(age) && parseInt(age, 10) > 0;
}