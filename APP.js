window.addEventListener('load', async () => {
    // --- BASIC SETUP ---
    if (!window.ethereum) {
        // Use the toast function for errors if it's available, otherwise alert
        try {
            showToast("Please install MetaMask to use this DApp!", 'error');
        } catch (e) {
            alert("Please install MetaMask to use this DApp!");
        }
        return;
    }
    
    
    const contractAddress = "0x2C47BAe66a8beaC06cF0E18527aA077DFA9F81Ce";
    const contractABI =[
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_serial",
				"type": "uint256"
			}
		],
		"name": "flagItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productCode",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_serial",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_madeAt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_expiresAt",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			}
		],
		"name": "registerItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "serial",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "fromAddr",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "toAddr",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "RecordedTransfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_serial",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			}
		],
		"name": "retailerToEndUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_who",
				"type": "address"
			},
			{
				"internalType": "enum SupplyChainPharma.UserRole",
				"name": "_role",
				"type": "uint8"
			}
		],
		"name": "setRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_serial",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			}
		],
		"name": "wholesalerToRetailer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "administrator",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "flagged",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "items",
		"outputs": [
			{
				"internalType": "string",
				"name": "productCode",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "serial",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "madeAt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "expiresAt",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "holder",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "updatedAt",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_serial",
				"type": "uint256"
			}
		],
		"name": "statusOf",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userRoles",
		"outputs": [
			{
				"internalType": "enum SupplyChainPharma.UserRole",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_serial",
				"type": "uint256"
			}
		],
		"name": "viewHops",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // --- UI ELEMENTS ---
    const connectButton = document.getElementById('connectButton');
    const accountSpan = document.getElementById('account');
    const medicineInfoDiv = document.getElementById('medicineInfo');
    
    const assignRoleButton = document.getElementById('assignRoleButton');
    const createMedicineButton = document.getElementById('createMedicineButton');
    const transferToPharmacyButton = document.getElementById('transferToPharmacyButton');
    const transferToPatientButton = document.getElementById('transferToPatientButton');
    const checkStatusButton = document.getElementById('checkStatusButton');
    const getHistoryButton = document.getElementById('getHistoryButton');
    const rejectMedicineButton = document.getElementById('rejectMedicineButton');

    // --- HELPER FUNCTIONS (TOASTS, SPINNERS, TABS) ---
    const showToast = (message, type = 'info') => {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const toggleSpinner = (button, show) => {
        if (!button) return;
        const spinner = button.querySelector('.spinner');
        const buttonText = button.querySelector('.button-text');
        if (show) {
            if(spinner) spinner.style.display = 'inline-block';
            if(buttonText) buttonText.style.opacity = '0';
            button.disabled = true;
        } else {
            if(spinner) spinner.style.display = 'none';
            if(buttonText) buttonText.style.opacity = '1';
            button.disabled = false;
        }
    };
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    const handleTransaction = async (button, txFunction, ...args) => {
        toggleSpinner(button, true);
        try {
            // Ensure inputs are BigNumber-friendly where needed
            const preparedArgs = args.map(arg => {
                // Ensure serial numbers are handled as BigNumbers if they come from input fields
                if (typeof arg === 'string' && /^\d+$/.test(arg) && arg.length > 15) {
                    return ethers.BigNumber.from(arg);
                }
                return arg;
            });
            
            if (!txFunction) {
                 showToast("Contract function is not defined. Check function names.", 'error');
                 return;
            }

            const tx = await txFunction(...preparedArgs);
            showToast("Transaction sent... waiting for confirmation.");
            await tx.wait();
            showToast("Transaction confirmed successfully!", 'success');
        } catch (error) {
             console.error("Transaction Error:", error);
            // Provide a more descriptive error message if available
            showToast(error.reason || (error.message.includes('revert') ? "Transaction failed (Check roles/permissions/input values)." : "Transaction failed."), 'error');
        } finally {
            toggleSpinner(button, false);
        }
    };

    // --- WEB3 FUNCTIONS ---
    const connectWallet = async () => {
        toggleSpinner(connectButton, true);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length > 0) {
                const account = accounts[0];
                accountSpan.innerText = `${account.substring(0, 6)}...${account.substring(38)}`;
                showToast("Wallet connected successfully!", 'success');
            }
        } catch (error) {
            showToast("Failed to connect wallet. Please approve the request in MetaMask.", 'error');
        } finally {
            toggleSpinner(connectButton, false);
        }
    };
    
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            const account = accounts[0];
            accountSpan.innerText = `${account.substring(0, 6)}...${account.substring(38)}`;
        } else {
            accountSpan.innerText = "Not Connected";
            showToast("Wallet disconnected.", 'error');
        }
    });
    
    // --- EVENT LISTENERS (Updated to match SupplyChainPharma contract) ---
    connectButton.addEventListener('click', connectWallet);

    // Admin: setRole
    assignRoleButton.addEventListener('click', () => {
        const address = document.getElementById('assignRoleAddress').value;
        const role = document.getElementById('assignRoleRole').value;
        if (!address || !role) return showToast("Address and Role are required.", 'error');
        // Contract function: setRole(address _who, UserRole _role)
        handleTransaction(assignRoleButton, contract.setRole, address, parseInt(role)); 
    });

    // Manufacturer: registerItem (Includes date conversion for UX)
    createMedicineButton.addEventListener('click', () => {
        const productID = document.getElementById('createProductId').value;
        const serialNo = document.getElementById('createSerialNo').value;
        const mfgDateString = document.getElementById('createMfgDate').value; // YYYY-MM-DD
        const expDateString = document.getElementById('createExpDate').value; // YYYY-MM-DD
        const to = document.getElementById('createToAddress').value; // Wholesaler Address

        if (!productID || !serialNo || !mfgDateString || !expDateString || !to) {
            return showToast("All fields are required.", 'error');
        }
        
        // Convert YYYY-MM-DD date strings to Unix timestamps (seconds)
        // Set date to start of day for consistency
        const mfgTimestamp = Math.floor(new Date(mfgDateString).setUTCHours(0,0,0,0) / 1000);
        const expTimestamp = Math.floor(new Date(expDateString).setUTCHours(0,0,0,0) / 1000);

        if (isNaN(mfgTimestamp) || isNaN(expTimestamp) || mfgTimestamp <= 0 || expTimestamp <= 0) {
            return showToast("Invalid Date selection.", 'error');
        }

        // Contract function: registerItem(string calldata _productCode, uint256 _serial, uint256 _madeAt, uint256 _expiresAt, address _to)
        handleTransaction(
            createMedicineButton, 
            contract.registerItem, 
            productID, 
            serialNo, 
            mfgTimestamp, 
            expTimestamp, 
            to
        );
    });

    // Wholesaler: wholesalerToRetailer
    transferToPharmacyButton.addEventListener('click', () => {
        const serialNo = document.getElementById('transferToPharmacySerialNo').value;
        const to = document.getElementById('transferToPharmacyAddress').value; // Retailer Address
        if (!serialNo || !to) return showToast("Serial Number and Address are required.", 'error');
        // Contract function: wholesalerToRetailer(uint256 _serial, address _to)
        handleTransaction(transferToPharmacyButton, contract.wholesalerToRetailer, serialNo, to);
    });

    // Retailer: retailerToEndUser
    transferToPatientButton.addEventListener('click', () => {
        const serialNo = document.getElementById('transferToPatientSerialNo').value;
        const to = document.getElementById('transferToPatientAddress').value; // EndUser Address
        if (!serialNo || !to) return showToast("Serial Number and Address are required.", 'error');
        // Contract function: retailerToEndUser(uint256 _serial, address _to)
        handleTransaction(transferToPatientButton, contract.retailerToEndUser, serialNo, to);
    });

    // EndUser: flagItem
    rejectMedicineButton.addEventListener('click', () => {
        const serialNo = document.getElementById('patientSerialNo').value;
        if (!serialNo) return showToast("Serial Number is required.", 'error');
        // Contract function: flagItem(uint256 _serial)
        handleTransaction(rejectMedicineButton, contract.flagItem, serialNo);
    });

    // EndUser: statusOf
    checkStatusButton.addEventListener('click', async () => {
        const serialNo = document.getElementById('patientSerialNo').value;
        if (!serialNo) return showToast("Serial Number is required.", 'error');
        toggleSpinner(checkStatusButton, true);
        try {
            // Contract function: statusOf(uint256 _serial) returns (uint8)
            const statusEnum = await contract.statusOf(serialNo);
            // Status mapping: 0 = ok, 1 = expired, 2 = flagged/rejected
            const statusMap = ["Valid (OK)", "Expired", "Rejected/Flagged"];
            
            let displayMessage = `Medicine Status: ${statusMap[statusEnum]}`;

            // Fetch item details to display alongside status
            try {
                const item = await contract.items(serialNo);
                const manufactureDate = new Date(item.madeAt.toNumber() * 1000).toLocaleDateString();
                const expiryDate = new Date(item.expiresAt.toNumber() * 1000).toLocaleDateString();
                const productCode = item.productCode;

                displayMessage += `\nProduct Code: ${productCode}`;
                displayMessage += `\nManufactured On: ${manufactureDate}`;
                displayMessage += `\nExpires On: ${expiryDate}`;
                
                if (statusEnum == 2) {
                    displayMessage += `\n\n(This item was flagged by the patient/end user)`;
                } else if (statusEnum == 1) {
                    displayMessage += `\n\n(This item is past its expiration date)`;
                }
            } catch (e) {
                console.warn("Failed to retrieve item details or serial not registered:", e);
                displayMessage += "\n\n(Could not fetch detailed item information.)";
            }

            medicineInfoDiv.innerText = displayMessage;
            showToast("Status fetched!", 'success');
        } catch (error) {
            showToast(error.reason || "Failed to get status (Requires caller to be EndUser holder).", 'error');
        } finally {
            toggleSpinner(checkStatusButton, false);
        }
    });

    // EndUser: viewHops
    getHistoryButton.addEventListener('click', async () => {
        const serialNo = document.getElementById('patientSerialNo').value;
        if (!serialNo) return showToast("Serial Number is required.", 'error');
        toggleSpinner(getHistoryButton, true);
        try {
            // Contract function: viewHops(uint256 _serial) returns (address[] memory)
            const history = await contract.viewHops(serialNo);
            
            let historyText = `Transfer History for Serial No ${serialNo}:\n\n`;
            if (history.length === 0) {
                historyText += "No history found.";
            } else {
                // UserRole enum mapping: 0=Unassigned, 1=Maker, 2=Wholesaler, 3=Retailer, 4=EndUser
                const roleMap = ["Unassigned (0)", "Maker (1)", "Wholesaler (2)", "Retailer (3)", "EndUser (4)"];
                
                for (let i = 0; i < history.length; i++) {
                    const address = history[i];
                    // Correctly calling the public mapping userRoles(address)
                    const roleEnum = await contract.userRoles(address);
                    
                    historyText += `Step ${i + 1}: ${roleMap[roleEnum]} Address: ${address.substring(0, 10)}...${address.substring(38)}\n`;
                }
            }
            medicineInfoDiv.innerText = historyText;
            showToast("History loaded!", 'success');
        } catch (error) {
            showToast(error.reason || "Failed to get history (Requires caller to be EndUser holder).", 'error');
        } finally {
            toggleSpinner(getHistoryButton, false);
        }
    });
});
