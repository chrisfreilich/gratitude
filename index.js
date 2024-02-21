import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://realtime-database-8b021-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const gratitudeListInDB = ref(database, "gratitude")

const entryFieldEl = document.getElementById("entry")
const toFieldEl = document.getElementById("to")
const fromFieldEl = document.getElementById("from")
const postingsEl = document.getElementById("postings")

document.getElementById("publish").addEventListener("click", function() {

    const newGratitude = {
        "from"   : fromFieldEl.value,
        "to"     : toFieldEl.value,
        "entry"  : entryFieldEl.value,
        "likes"  : 0
    }

    push(gratitudeListInDB, newGratitude)

    entryFieldEl.value = ""
    fromFieldEl.value = ""
    toFieldEl.value = ""
})

onValue(gratitudeListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())    
        postingsEl.innerHTML = ""
        
        for (let i = itemsArray.length - 1; i >=0 ; i--) {
            if (itemsArray[i][0] != 0) {
                appendItemToPostingsEl(itemsArray[i])
            }
        }    
    } 
    
    if (postingsEl.innerHTML == "") {
        appendItemToPostingsEl("We need some gratitude!")
    }
})

function appendItemToPostingsEl(item) {   

    let newEl = document.createElement("div")
    let { to, from, entry, likes } = item[1]
    const gratitudeId = item[0]
    
    // Determine whether user has liked this post or not
    let userLikesString = localStorage.getItem("likes")
    let userLikes = JSON.parse(userLikesString)
    let userLikedPost = (userLikes && userLikes.includes(gratitudeId))

    // Build HTML for posting
    let str = ""
    let fromStr = from ? `From: ${from}` : ""
    let zeroLikes = likes > 0 ? "" : "zero-likes"
    let likesStr = userLikedPost ? `<p class="heart-full">\u2665</p>` : `<p class="heart-empty ${zeroLikes}">\u2661</p>`
    likesStr += likes ? `<p class="like-count">${likes}</p>` : ""

    // Don't add gratitude if entry field is blank (should never be if we validate before saving)
    if (!entry) { return }

    // Only add the To paragraph if the to field is populated
    if (to) {
        str = `<p class="to-from">I am grateful to <span>${to}</span>...</p>`
    }

    str += `<p class="gratitude-entry">${entry}</p>`
    
    // Footer
    str += `<div class="entry-footer">`
    str += `<p class="to-from">${fromStr}</p>`
    str += `<div class="likes" id="${gratitudeId}">${likesStr}</div>`
    str += `</div>` // end footer

    newEl.innerHTML = str
    postingsEl.append(newEl)

    // Add event listener for likes
    document.getElementById(gratitudeId).addEventListener('click', function() {
        
        let clickLikes = likes

        // Determine whether user has liked this post or not
        let clickUserLikesString = localStorage.getItem("likes")
        let clickUserLikes = JSON.parse(clickUserLikesString)
        let clickUserLikedPost = (clickUserLikes && clickUserLikes.includes(gratitudeId))

        if (clickUserLikedPost) {
            clickLikes--
            clickUserLikesString = JSON.stringify(clickUserLikes.filter(item => item !== gratitudeId))
        } else {
            clickLikes++
            if (!clickUserLikes) { clickUserLikes = [] }
            clickUserLikes.push(gratitudeId)
            clickUserLikesString = JSON.stringify(clickUserLikes)
        }            
        const gratitudeInDB = ref(database, `gratitude/${gratitudeId}`)
        localStorage.setItem("likes", clickUserLikesString)
        update(gratitudeInDB, { likes: clickLikes })        
    })
}