var Getopt = require('node-getopt')
  , Promise = require('promise')
  , path = require('path')
  , fs = require('fs')
  , lwip = require('lwip');

var readdir = Promise.denodeify(fs.readdir);

// var gmSizeNodeified = function(gm, callback) {
//     gm.size(callback);
// };
// var gmSize = Promise.denodeify(gmSizeNodeified);

var lwipOpen = Promise.denodeify(lwip.open);
var lwipPaste = Promise.denodeify(lwip.paste);

var opt = new Getopt([
  ['s'  , 'sheet=ARG'],
  ['w'  , 'width=ARG'],
  ['h'  , 'height=ARG'],
  ['' , 'help']
]).bindHelp().parseSystem();

var baseFolder = "../textures";
var folder = path.join(baseFolder, opt.options.sheet);
var width = Number(opt.options.width);
var height = Number(opt.options.height);

var widthWithBuffer = width+1;
var heightWithBuffer = height+1;

var sheetStart = "if(typeof Textures === 'undefined') {\n";
sheetStart+=     "  Textures = {};\n";
sheetStart+=     "};\n\n";
sheetStart+=     "Textures."+opt.options.sheet+"Sheet = ";

console.log(widthWithBuffer, heightWithBuffer);

var animsPromise = readdir(folder);
var animsWithFrameFolders = animsPromise.then(function(anims) {
    return anims.filter(function(a) {
        return a != opt.options.sheet+".png" && a != opt.options.sheet+".js";
    }).map(function(anim) {
        return {"name": anim, "frameFolder":path.join(folder, anim)};
    });
});

var animsWithFrameFileLocs = animsWithFrameFolders.then(function(anims) {
    return Promise.all(anims.map(function(anim) {
        return readdir(anim.frameFolder).then(function(animFiles) {
            anim.frameFileLocs = animFiles.filter(function(l) {
                return l[0] != '.';
            }).map(function(f) {
               return path.join(anim.frameFolder, f)
            });
            return anim;
        })
    }))
});

var animsWithFrames = animsWithFrameFileLocs.then(function(anims) {
    return Promise.all(anims.map(function(anim) {
        return Promise.all(anim.frameFileLocs.map(function(fileLoc) {
            console.log("Opening "+fileLoc);
            return lwipOpen(fileLoc);
        })).then(function(frames) {
            anim.frameLwips = frames;
            return anim;
        });
    }))
});


animsWithFrames.done(function(anims) {
    var frameCounts = anims.map(function(a) {return a.frameLwips.length});
    var totalImages = frameCounts.reduce(function(a, b) {return a + b});
    var edge = 0;
    for(var i = 3; i < 10; i++) {
        edge = Math.pow(2, i);
        var widthCount = Math.floor(edge/widthWithBuffer);
        var heightCount = Math.floor(edge/heightWithBuffer);

        if(widthCount * heightCount > totalImages) {
            break;
        }
    }

    var frameCounts = anims.map(function(a) {return a.frameFileLocs.length});
    var totalImages = frameCounts.reduce(function(a, b) {return a + b});
    var edge = 0;
    for(var i = 3; i < 100; i++) {
        edge = Math.pow(2, i);
        var widthCount = Math.floor(edge/widthWithBuffer);
        var heightCount = Math.floor(edge/heightWithBuffer);

        if(widthCount * heightCount > totalImages) {
            break;
        }
    }

    var sheet = {};
    sheet.xScale = width/edge;
    sheet.yScale = height/edge;
    sheet.anims = {};
    sheet.textureLocation = "textures/"+opt.options.sheet+"/"+opt.options.sheet+".png"

    lwip.create(edge, edge, {r:0, g:0, b:0, a:0}, function(err, image) {
        var x = 0;
        var y = edge - height;
        var imageBatch = image.batch();
        for(var i in anims) {
            var anim = anims[i];
            var sheetAnim = {
                frames: [],
                frameLength: 84
            }

            for(var j in anim.frameLwips) {
                var f = anim.frameLwips[j];
                
                if(x+widthWithBuffer>edge) {
                    x = 0;
                    y-= heightWithBuffer;
                }
                imageBatch.paste(x, y, f);
                var frameDetail = {
                    x: x/edge,
                    y: (edge -(y+height))/edge
                }
                sheetAnim.frames.push(frameDetail);
                x+=widthWithBuffer;
            }

            sheet.anims[anim.name] = sheetAnim;
        }
        var resultLoc = path.join(folder, opt.options.sheet+".png");
        console.log("Writing to "+resultLoc);
        imageBatch.writeFile(resultLoc, function() {
            var sheetLoc = path.join(folder, opt.options.sheet+".js");
            fs.writeFile(sheetLoc, sheetStart+JSON.stringify(sheet, null, ' '), function() {
                console.log("Finished");
            })
        });
    });
    
});




