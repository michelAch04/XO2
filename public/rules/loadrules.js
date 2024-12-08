function loadRules() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "rules/rules.xml", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            displayRules(xhr.responseXML);
        }
    };
    xhr.send();
}

function displayRules(xml) {
    const rulesContainer = document.getElementById("rules-container");

    // Get sections
    const generalRules = xml.getElementsByTagName("general")[0];
    const gameplayRules = xml.getElementsByTagName("gameplay")[0];
    const advancedRules = xml.getElementsByTagName("advanced")[0];

    // Populate HTML
    rulesContainer.innerHTML = `
      <h2>General Rules</h2>
      <ul>${getRulesList(generalRules)}</ul>
      <h2>Gameplay Rules</h2>
      <ul>${getRulesList(gameplayRules)}</ul>
      <h2>Advanced Strategies</h2>
      <ul>${getRulesList(advancedRules)}</ul>
    `;
}

function getRulesList(section) {
    const rules = section.getElementsByTagName("rule");
    let html = "";
    for (let i = 0; i < rules.length; i++) {
        html += `<li>${rules[i].textContent}</li>`;
    }
    return html;
}

// Load rules on page load
window.onload = loadRules;