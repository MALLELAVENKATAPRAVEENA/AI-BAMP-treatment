"""
Sample Dataset Generator for Class III BAMP Treatment Outcome Research
"""

import pandas as pd
import numpy as np

def generate_sample_bamp_dataset(num_samples: int = 150):
    np.random.seed(42)

    ages = np.random.uniform(8.5, 14.5, num_samples).round(1)
    genders = np.random.choice(["Female", "Male"], num_samples, p=[0.55, 0.45])
    cvm_stages = np.random.choice(["CVM 1", "CVM 2", "CVM 3", "CVM 4", "CVM 5"], num_samples, p=[0.10, 0.25, 0.35, 0.20, 0.10])
    
    sna_list = np.random.normal(79.5, 3.2, num_samples).round(1)
    snb_list = np.random.normal(83.0, 3.5, num_samples).round(1)
    anb_list = (sna_list - snb_list).round(1)
    wits_list = np.random.normal(-3.8, 2.1, num_samples).round(1)
    fma_list = np.random.normal(25.5, 4.0, num_samples).round(1)

    outcomes = []
    probabilities = []

    for i in range(num_samples):
        prob = 85.0
        if cvm_stages[i] in ["CVM 2", "CVM 3"]:
            prob += 8.0
        elif cvm_stages[i] == "CVM 5":
            prob -= 18.0
        
        if anb_list[i] < -5.0:
            prob -= 10.0

        prob = min(98.0, max(45.0, prob + np.random.normal(0, 3.0)))
        probabilities.append(round(prob, 1))

        if prob > 85.0:
            outcomes.append("Success")
        elif prob >= 70.0:
            outcomes.append("Moderate Risk")
        else:
            outcomes.append("High Risk")

    df = pd.DataFrame({
        "Patient_ID": [f"BAMP-DATA-{i+1001}" for i in range(num_samples)],
        "Age": ages,
        "Gender": genders,
        "CVM_Stage": cvm_stages,
        "SNA_deg": sna_list,
        "SNB_deg": snb_list,
        "ANB_deg": anb_list,
        "Wits_mm": wits_list,
        "FMA_deg": fma_list,
        "Success_Probability": probabilities,
        "Outcome_Category": outcomes
    })

    return df

if __name__ == "__main__":
    df = generate_sample_bamp_dataset(150)
    df.to_csv("bamp_sample_dataset.csv", index=False)
    print(f"Generated sample BAMP dataset with {len(df)} records in bamp_sample_dataset.csv")
