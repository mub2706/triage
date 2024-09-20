document.addEventListener('DOMContentLoaded', function () {
    const removeBtn = document.getElementById('removeBtn');
    removeBtn.addEventListener('click', removeEntry);
    const increaseBtn = document.getElementById('increaseBtn');
    increaseBtn.addEventListener('click', increasePriority);
    const decreaseBtn = document.getElementById('decreaseBtn');
    decreaseBtn.addEventListener('click', decreasePriority);

    function removeEntry() {
        const selectedRow = document.querySelector('input[name="selectRow"]:checked');
        if (!selectedRow) {
            alert('Please select a row.');
            return;
        }

        const selectedTriageId = selectedRow.value;

        fetch(`/remove-triage/${selectedTriageId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to remove selected triage entry.');
                }

                location.reload();
            })
            .catch(error => {
                console.error('Error removing triage:', error);
                alert('Failed to remove selected entry. Please try again.');
            });
    }

    function increasePriority() {
        const selectedRow = document.querySelector('input[name="selectRow"]:checked');
        if (!selectedRow) {
            alert('Please select a row.');
            return;
        }

        const selectedTriageId = selectedRow.value;

        fetch(`/increase-priority/${selectedTriageId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to increase priority.');
                }

                location.reload();
            })
            .catch(error => {
                console.error('Error increasing priority:', error);
                alert('Failed to increase priority. Please try again.');
            });
    }

    function decreasePriority() {
        const selectedRow = document.querySelector('input[name="selectRow"]:checked');
        if (!selectedRow) {
            alert('Please select a row.');
            return;
        }

        const selectedTriageId = selectedRow.value;

        fetch(`/decrease-priority/${selectedTriageId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to decrease priority.');
                }

                location.reload();
            })
            .catch(error => {
                console.error('Error decreasing priority:', error);
                alert('Failed to decrease priority. Please try again.');
            });
    }

    function loadData() {
        fetch('/triage')
            .then(response => response.json())
            .then(data => {
                const tableBody = document.querySelector('.table tbody');
                tableBody.innerHTML = '';

                data.forEach(item => {
                    const row = tableBody.insertRow();
                    const keys = ['triage_id', 'name', 'age', 'triage_date', 'injury_desc', 'urgency_level_desc', 'addl_comments', 'wait_time'];

                    keys.forEach((key, index) => {
                        const cell = row.insertCell();
                        cell.className = 'column';
                        cell.setAttribute('data-category', key);

                        if (key === 'triage_id') {
                            cell.style.display = 'none';
                        } else {
                            cell.textContent = item[key];
                        }

                        if (key === 'wait_time') {
                            cell.textContent += ' mins';
                        }
                    });

                    const selectCell = row.insertCell();
                    selectCell.className = 'column';
                    selectCell.setAttribute('data-category', 'selectBtn');

                    const radioInput = document.createElement('input');
                    radioInput.type = 'radio';
                    radioInput.name = 'selectRow';
                    radioInput.value = item['triage_id'];
                    selectCell.appendChild(radioInput);
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    function handleRowSelection(event) {
        if (event.target.name === 'selectRow' && event.target.checked) {
            const selectedTriageId = event.target.value;
            console.log('Selected Triage ID:', selectedTriageId);

            const urgencyLevelCell = document.querySelector('[data-category="urgency_level_desc"]');
            const increaseBtn = document.getElementById('increaseBtn');
            const decreaseBtn = document.getElementById('decreaseBtn');

            if (urgencyLevelCell) {
                const urgencyLevel = parseInt(urgencyLevelCell.textContent, 10);

                increaseBtn.disabled = urgencyLevel === 1;
                decreaseBtn.disabled = urgencyLevel === 5;
            }
        }
    }

    loadData();

    document.addEventListener('change', handleRowSelection);
});
