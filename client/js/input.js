function Input(threeCamera, blockMesh) {
    var self = this;

    self.north = new InputButton("north");
    self.south = new InputButton("south");
    self.east = new InputButton("east");
    self.west = new InputButton("west");
    self.chop = new InputButton("chop");

    function handleButtonInteraction(e, down, button) {
        if(down) {
            button.push();
        } else {
            button.unpush();
        }

        e.stopPropagation(); 
        e.preventDefault();
    }

    function handleKeyPress(e, down) {
        if(e.keyCode==87) {
            handleButtonInteraction(e, down, self.north);
        }
        if(e.keyCode==68) {
            handleButtonInteraction(e, down, self.east);
        }
        if(e.keyCode==83) {
            handleButtonInteraction(e, down, self.south);
        }
        if(e.keyCode==65) {
            handleButtonInteraction(e, down, self.west);
        }

        if(e.keyCode==32) {
            handleButtonInteraction(e, down, self.chop);
        }
    }

    document.body.addEventListener('keyup', function(e){
        handleKeyPress(e, false);
    }, false);

    document.body.addEventListener('keydown', function(e){
        handleKeyPress(e, true);
    }, false);
}


function InputButton(name) {
    this.name = name;

    this.down = false;
    this.blocked = false;

    this.push = function() {
        if(!this.blocked) {
            this.down = true;
        }
    }

    this.clear = function() {
        this.blocked = true;
        this.down = false;
    }

    this.unpush = function() {
        this.blocked = false;
        this.down = false;
    }
}