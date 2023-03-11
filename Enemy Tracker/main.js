const enemies = document.querySelector(".enemies")
const inputName = document.getElementById("input-name")
const inputHp = document.getElementById("input-hp")
const inputArmor = document.getElementById("input-armor")
const inputMultiply = document.getElementById("input-multiply")
let allEnemies = []
let renderedEnemies = 0
let numberOfEnemies = 0
let animationLock = false;


let enemiesInLocalStorage 
if(JSON.parse(localStorage.getItem("allEnemies"))) {
    enemiesInLocalStorage = JSON.parse(localStorage.getItem("allEnemies"))
    allEnemies = enemiesInLocalStorage
    for(let enemy of allEnemies) {
        render(enemy)
        numberOfEnemies++
    }
}

let numberForNanoId = 0;

function nanoid () {
    numberForNanoId++
    return numberForNanoId;
}



document.getElementById("create-enemy").addEventListener("click", function() {
    if(inputName.value && inputHp.value && inputArmor.value && inputMultiply.value) {

        if(inputHp.value<0) inputHp.value = 1
        if(inputMultiply.value<0) inputMultiply.value = 1

        if(inputMultiply.value == 1) {
            allEnemies.push({
                "creatureName":inputName.value, 
                "creatureMaxHp":inputHp.value,
                "creatureCurrentHp":inputHp.value,
                "creatureArmor": inputArmor.value,
                "creatureId":nanoid()
            })
            renderedEnemies = 1
            numberOfEnemies++
            render(allEnemies[numberOfEnemies-1])
        }
        else {
            for(let i=0; i<inputMultiply.value; i++) {
                let name = `${inputName.value} #${i+1}`
                allEnemies.push({
                    "creatureName":name, 
                    "creatureMaxHp":inputHp.value,
                    "creatureCurrentHp":inputHp.value,
                    "creatureArmor": inputArmor.value,
                    "creatureId":nanoid()
                })
            }
            renderedEnemies = parseInt(inputMultiply.value)
            numberOfEnemies += renderedEnemies
            for(let i=renderedEnemies; i>0; i--) {
                render(allEnemies[numberOfEnemies-i])
            }
        }
        localStorage.setItem("allEnemies", JSON.stringify(allEnemies))
        inputName.value = ""
        inputHp.value = ""
        inputArmor.value = ""
        inputMultiply.value = "1"
        inputName.focus()
    }
})

document.addEventListener("click", function(e){
    if(e.target.dataset.handle == "attack" || e.target.dataset.handle == "heal") combat (e.target, e.target.dataset.handle)
    if(e.target.id == "delete-all") deleteAll()
    if(e.target.dataset.handle == "delete" && !animationLock) deleteEnemy(e.target)
    if(e.target.dataset.handle == "res") resurrect(e.target.parentElement)
    localStorage.setItem("allEnemies", JSON.stringify(allEnemies))
})


function combat(info, action) {
    let input = "inputNr" + info.parentElement.dataset.id
    let number = parseInt(document.getElementById(input).value)
    if(number) {
        if(number < 0) {
            number = 0
        }
        for(let enemy of allEnemies){
            if(enemy.creatureId == info.parentElement.dataset.id) {
                if(action=="attack") {
                    if(number>enemy.creatureCurrentHp) {
                        number = enemy.creatureCurrentHp
                    }
                    enemy.creatureCurrentHp -= number
                } else {
                    if(number+enemy.creatureCurrentHp>enemy.creatureMaxHp) {
                        number = enemy.creatureMaxHp - enemy.creatureCurrentHp
                    }
                    enemy.creatureCurrentHp += number
                }
                updateBars (info.parentElement.dataset.id, enemy.creatureCurrentHp, enemy.creatureMaxHp)
            }
        }
    }
    document.getElementById(input).value = ""
}


function deleteEnemy (info) {
    animationLock = true
    parentDiv = info.parentElement.parentElement
    parentDiv.classList.add("disappear")

    setTimeout(function() {
        enemies.removeChild(parentDiv)
    let number = parseInt(info.parentElement.dataset.id)
    let target = allEnemies.filter(item => {
        return item.creatureId == number
    })[0]

    let start = allEnemies.indexOf(target)
    allEnemies.splice(start, 1);
    numberOfEnemies--
    animationLock = false
    localStorage.setItem("allEnemies", JSON.stringify(allEnemies))
    },500)

}

function deleteAll() {
    animationLock = true

    let myAllEnemies = document.querySelectorAll(".enemy")
    myAllEnemies.forEach(enemy => enemy.classList.add("disappear"))

    setTimeout(() => {
        enemies.innerHTML=""
        allEnemies=[]
        numberOfEnemies = 0
        animationLock = false
        localStorage.setItem("allEnemies", JSON.stringify(allEnemies))
    },500)

}

function updateBars (nr, currentHp, maxHp) {
    const el1 = document.getElementById(`healthBarNr${nr}`)
    const el2 = document.getElementById(`healthBar2Nr${nr}`)
    el1.style.width = `${(currentHp/maxHp)*100}%`
    el2.innerHTML = `<span>${currentHp}/${maxHp}</span>`
    paintBars(el1, currentHp, maxHp)
    if(currentHp==0) {
        setTimeout(() => {
            const el3= document.getElementById(`deathScreenNr${nr}`)
            const el4 = document.getElementById(`dsNameNr${nr}`)
            const el5 = document.getElementById(`resButtonNr${nr}`)
            el4.innerHTML = `<h2><span>${findCreatureName(nr)}</span><h2> Has been slain <i class="fa-solid fa-skull"></i></h2>`
            console.log(el5)
            el3.style.width = "calc(100% + 2rem)"
            setTimeout(()=> {
                el4.style.display = "block"
                el4.classList.add("appear")
                el5.style.display = "block"
                el5.classList.add("button-fade")
            },1000)
        },1000)
    }
}

function findCreatureName (nr) {
    for(let enemy of allEnemies) {
        if(enemy.creatureId == nr) {
            return enemy.creatureName
        }
    }
}

function resurrect (info) {
    nr = info.dataset.nr
    const el1 = document.getElementById(`deathScreenNr${nr}`)
    const el2 = document.getElementById(`dsNameNr${nr}`)
    const el3 = document.getElementById(`resButtonNr${nr}`)

    el2.innerHTML = `<h2><span>${findCreatureName(nr)}</span></h2> <h2>Has been resurrected!</h2>`

    setTimeout(() => {
        el2.classList.remove("appear")
        el3.classList.remove("button-fade")
        el2.classList.add("disappear")
        el3.classList.add("disappear")
        el1.style.width= "0px"

        for(let enemy of allEnemies) {
            if(enemy.creatureId == nr) {
                enemy.creatureCurrentHp = 1
                updateBars (nr, enemy.creatureCurrentHp, enemy.creatureMaxHp)
            }
        }

        setTimeout(() => {
            el2.style.display = "none"
            el3.style.display = "none"
        },500)

        setTimeout(() => {
        el2.classList.remove("disappear")
        el3.classList.remove("disappear")
    },1000)

    }, 1000)
}

function paintBars (bar, currentHp, maxHp) {
    if((currentHp/maxHp)*100>70) {
        bar.style.background = "rgb(56,203,1)"
        bar.style.background =  "linear-gradient(90deg, rgba(56,203,1,1) 0%, rgba(4,148,1,1) 100%)"
    } else if ((currentHp/maxHp)*100<=30) {
        bar.style.background = "rgb(255,27,27)"
        bar.style.background =  "linear-gradient(90deg, rgba(255,27,27,1) 0%, rgba(140,0,0,1) 100%)"
    } else {
        bar.style.background = "rgb(237,238,4)"
        bar.style.background =  "linear-gradient(90deg, rgba(237,238,4,1) 0%, rgba(228,116,4,1) 100%)"
    }

}

function render (enemy) {

    let anEnemy = document.createElement("div")
    anEnemy.classList.add("enemy")

    let deathScreen = document.createElement("div")
    deathScreen.classList.add("death-screen")
    deathScreen.id = `deathScreenNr${enemy.creatureId}`
    
    let dsName = document.createElement("div")
    dsName.classList.add("ds-name")
    dsName.id=`dsNameNr${enemy.creatureId}`
    dsName.innerHTML = `<h2><span>${enemy.creatureName}</span></h2> <h2> Has been slain <i class="fa-solid fa-skull"></i></h2>`

    let enemyRes = document.createElement("div")
    enemyRes.classList.add("enemy-res")
    enemyRes.innerHTML = `<button data-handle="res"><i class="fa-solid fa-heart"></i></button>`
    enemyRes.id = `resButtonNr${enemy.creatureId}`
    enemyRes.dataset.nr = enemy.creatureId


    if(enemy.creatureCurrentHp==0) {
        deathScreen.style.width = "calc(100% + 2rem)"
        dsName.style.display = "block"
        enemyRes.style.display = "block"
        
    }

    deathScreen.append(dsName)

    enemies.append(anEnemy)

    let enemyName = document.createElement("div")
    enemyName.classList.add("enemy-name")
    enemyName.innerHTML = `<h3>${enemy.creatureName}</h3>`

    let enemyAc = document.createElement("div")
    enemyAc.classList.add("enemy-ac")
    enemyAc.innerHTML = `<h3>${enemy.creatureArmor}<i class="fa-solid fa-shield-halved"></i></h3>`

    let enemyMaxHp = document.createElement("div")
    enemyMaxHp.classList.add("health-bar")
    enemyMaxHp.id = `healthBar2Nr${enemy.creatureId}`
    enemyMaxHp.innerHTML = `<span>${enemy.creatureCurrentHp}/${enemy.creatureMaxHp}</span>`

    let enemyCurrentHp = document.createElement("div")
    enemyCurrentHp.classList.add("current-health-bar")
    enemyCurrentHp.id = `healthBarNr${enemy.creatureId}`
    enemyCurrentHp.style.width = `${(enemy.creatureCurrentHp/enemy.creatureMaxHp)*100}%`
    paintBars (enemyCurrentHp, enemy.creatureCurrentHp, enemy.creatureMaxHp)

    let dmgHeal = document.createElement("div")
    dmgHeal.classList.add("dmg-heal")
    dmgHeal.dataset.id=enemy.creatureId

    let dmgBtn = document.createElement("div")
    dmgBtn.classList.add("dmg-btn")
    dmgBtn.dataset.handle = "attack"
    dmgBtn.innerHTML = `<i class="fa-solid fa-hand-fist"></i>`

    let myInput = document.createElement("input")
    myInput.id = `inputNr${enemy.creatureId}`
    myInput.type="number"

    let healBtn = document.createElement("div")
    healBtn.classList.add("heal-btn")
    healBtn.dataset.handle = "heal"
    healBtn.innerHTML = `<i class="fa-solid fa-notes-medical"></i>`

    dmgHeal.append(dmgBtn, myInput, healBtn)

    let enemyDelete = document.createElement("div")
    enemyDelete.classList.add("delete-enemy")
    enemyDelete.innerHTML = `<button data-handle="delete"><i class="fa-solid fa-trash"></i></button>`
    enemyDelete.dataset.id = enemy.creatureId

    anEnemy.append(enemyName, enemyAc, enemyMaxHp, enemyCurrentHp, dmgHeal, enemyDelete,  deathScreen, enemyRes)
}
