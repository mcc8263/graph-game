window.onload = function(e) {
    //console.log("connecting to firebase")

    const firebaseConfig = {
        apiKey: "AIzaSyAEZALZrniQYlLBTRhxIfhBc87S7KyTXK8",
        authDomain: "cs-396-a2.firebaseapp.com",
        databaseURL: "https://cs-396-a2-default-rtdb.firebaseio.com",
        projectId: "cs-396-a2",
        storageBucket: "cs-396-a2.appspot.com",
        messagingSenderId: "609131769464",
        appId: "1:609131769464:web:2c30a319e659ceb24f878d"
      };

      
    try {
        firebase.initializeApp(firebaseConfig)
        //console.log("firebase init!")
        firebase.auth().onAuthStateChanged((user) => console.log("authorized"));
        firebase.auth().signInAnonymously()
        .then((data) => {
            console.log("...firebase auth: signed in anonymously")
        })
        .catch((error) => {
            console.warn("firebase error", error.code, error.message)
        });
    }
    catch (err) {
        console.warn("can't connect to firebase")
    }

    const db = firebase.database()
    const userRef = db.ref("user")
    const playerRef = db.ref("players")
    const xRef = db.ref("x-axis")
    const yRef = db.ref("y-axis")

    new Vue({

        el: "#app",

        template: `
        <div id="app">
        <span class="title">EMPIRICAL DATA SIMULATOR</span>
            <div class="sidebar">
            <span>your dot</span>
            <span id="dot" class="dot" style="position:relative"></span>
            <br>
            <span>color</span>
            <input type="color" v-model="user.color">
            <br>
            <span>size</span>
            <input type="number" min="5" max="30" v-model="user.size">
            </div>
            <div class="main">
            <img src="./grid.avif" style="width:100%;height=100%;opacity:50%">
            <div id="dots">
            </div>
            </div>
            <button class="down btn" @click="down">&#8595;</button>
            <button class="up btn" @click="up">&#8593;</button>
            <button class="left btn" @click="left">&#8592;</button>
            <button class="right btn" @click="right">&#8594;</button>
            <input class="xax" id="xax" v-model="xax" value="time">
            <input class="yax" id="yax" v-model="yax" value="burger">
        </div>
        `,

        methods: {
            newGame() {
                playerRef.set(null);
            },

            up() {
                if (this.user.y > 0) {
                    this.user.y -= 10;
                }
            },
            down() {
                if (this.user.y + 10 < 600 - this.user.size) {
                    this.user.y += 10;
                }
            },
            left() {
                if (this.user.x > 0) {
                    this.user.x -= 10;
                }
            },
            right() {
                if (this.user.x + 10 < 600 - this.user.size) {
                    this.user.x += 10;
                }
            }
        },

    

        mounted() {

            //-------------------TRACK PLAYERS------------------------
            playerRef.on("value", (snapshot) => {
                //console.log(snapshot)
                let val = snapshot.val()
                //console.log("players!", val)

                console.log("NEW PLAYER")


                //if (!document.getElementById("dots").hasChildNodes()) {
                    for (player in val) {

                        dot = document.getElementById(val[player].id)
                        if (dot) {
                            console.log("dot exists")
                            dot.style.backgroundColor = val[player].color
                            dot.style.height = val[player].size + "px"
                            dot.style.width = val[player].size + "px"
                            dot.style.top = val[player].y + "px"
                            dot.style.left = val[player].x + "px"
                        }
                        else {
                            console.log("new dot")
                            newDot = document.createElement("span")
                            newDot.id = val[player].id
                            newDot.style.backgroundColor = val[player].color
                            newDot.style.height = val[player].size + "px"
                            newDot.style.width = val[player].size + "px"
                            newDot.style.top = val[player].y + "px"
                            newDot.style.left = val[player].x + "px"
                            newDot.className = "dot"
                            document.getElementById("dots").appendChild(newDot)
                        }
                    }
                //}

            })

            
            xRef.on("value", (snapshot) => {
                let val = snapshot.val()
                document.getElementById("xax").value = val

            });
            

            yRef.on("value", (snapshot) => {
                let val = snapshot.val()
                document.getElementById("yax").value = val

            });
            


            //-------------------INIT USERS LOCALSTORAGE-------------------------
            if (!localStorage.getItem("user")) {
                user = {
                    "id": "0",
                    "color": "#000000",
                    "size": "12",
                    "x": "580",
                    "y": "60"
                }

                user.x = Math.random() * 600;
                user.y = Math.random() * 600;
        
                let stringUser = JSON.stringify(user, null, 2)
                localStorage.setItem("user", stringUser)
                this.user = user

                let nextRef = playerRef.push()
                this.user.id = nextRef.key
                nextRef.set(this.user)

            }
            else {
                let jsonData = localStorage.getItem("user");
                user = JSON.parse(jsonData);
                this.user = user
            }

            //-------------------TRACK USERS------------------------
            userRef.on("value", (snapshot) => {
                //console.log(snapshot)
                let val = snapshot.val()
                //console.log("NAME!", val)
            })
            
            userRef.set(user)  

            
            xRef.get().then((snapshot) => {
                document.getElementById("xax").value = snapshot.val()
                });

            yRef.get().then((snapshot) => {
                document.getElementById("yax").value = snapshot.val()
                });
              
                

            document.getElementById("dot").style.backgroundColor = this.user.color;
            document.getElementById("dot").style.height = this.user.size + "px";
            document.getElementById("dot").style.width = this.user.size + "px";
        
        },
        
        data() {
            return {
                user: 0,
                xax: "time",
                yax: "burger"
            }
        },

        watch: {
            "user.color"() {
                document.getElementById("dot").style.backgroundColor = this.user.color;

                dot = document.getElementById(this.user.id)
                if (dot) {
                    dot.style.backgroundColor = this.user.color;
                }

                let stringUser = JSON.stringify(user, null, 2)
                localStorage.setItem("user", stringUser)
                userRef.set(user)
                
                playerRef.child(this.user.id).set(user)
            },

            "user.size"() {
                document.getElementById("dot").style.height = this.user.size + "px";
                document.getElementById("dot").style.width = this.user.size + "px";

                dot = document.getElementById(this.user.id)
                if (dot) {
                    dot.style.height = this.user.size + "px";
                    dot.style.width = this.user.size + "px";
                }

                let stringUser = JSON.stringify(user, null, 2)
                localStorage.setItem("user", stringUser)
                userRef.set(user)
                
                playerRef.child(this.user.id).set(user)
            },

            "user.x"() {
                dot = document.getElementById(this.user.id)
                if (dot) {
                    dot.style.left = this.user.x + "px";
                }

                let stringUser = JSON.stringify(user, null, 2)
                localStorage.setItem("user", stringUser)
                userRef.set(user)
                
                playerRef.child(this.user.id).set(user)
            },

            "user.y"() {
                dot = document.getElementById(this.user.id)
                if (dot) {
                    dot.style.top = this.user.y + "px";
                }

                let stringUser = JSON.stringify(user, null, 2)
                localStorage.setItem("user", stringUser)
                userRef.set(user)
                
                playerRef.child(this.user.id).set(user)
            },

            xax() {
                xRef.set(this.xax)
            },

            yax() {
                yRef.set(this.yax)
            }


        }
    });

}