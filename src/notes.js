 //NEDS WORK
    // Set up cards for "user" and "pass" and add <a> or btn to save to clip board along with a msg displaying the function happening
        //Currently works for the previously saved password but needs refresh if the user updates the username/pswd
 
 //DONE
    // change font for modal header
    // style button
    // style buttons (other one)
    // late game new background img 
    // Fix the modal pop up when there is no existing data


// EASIEST:
    // Use viewport (responsive) styling to conditionally set an ign's font-size
    


// MEDIUM TIME TO COMPLETE: 
   
    // import all ranked borders and assign per rank so its not just masters for some reason
        //LOGIC
            //leagueData: "tier" will coordinate with each wing icon
            //  challengerBorder for CHALLENGER
            //  gMasterBorder for GRANDMASTER
            //  masterBorder for MASTER
            //  diamondBorder for DIAMOND
            //  emeraldBorder for EMERALD and PLATINUM
            //  goldBorder for GOLD
            //  silverBorder for SILVER
            //  bronzeBorder for BRONZE
            //  ironBorder for IRON

    // Use the "leagyeApiMatchId" to retrieve the matchId's (20) then store only the result and champion 
    // Use "https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/champion.json" to get the champion ICON and send to App.js :] ALong with W/L to conditionally style the W/L section 


//Hardest? requires data too?idk
    // DECAY FORMULA
    // responsive for mobile




// DECAY FUNCTIONALITY

//11:44pm PST ladder reset 

//decay_games = decay games left when last updated
//decay_day = last day when decay game was updated

//count how many times 11:44 has past since decay game was updated and subtract from decay_games
//go through match history of 14 games, check how many games someone has played since decay_day 
//add amount to decay_games 
//if decay_games > 14, set to 14
//set new decay_day to today

const start = Date.now();
doSomeLongRunningProcess();
console.log(`Time elapsed: ${Date.now() - start} ms`);

//specific for each account
//when they update their decay games start timer


// margin equal for top and bottom based off the user/pass and top of ranked border
// 