let mapContainer = document.querySelector('#map');

let game = {
    teams: {
        q: 0,
        all:[]
    },
    whoStep: '',
    nextStepWhoCounter: 0
};


class Team {
    
    constructor (name, styleName) {
        this.points = 0;
        this.regionOwner = [];
        this.regionStyleName = styleName;
        this.name = name;
        game.teams.all[game.teams.q] = this;
        game.teams.q++;
    }
}

console.log(game);


let teamOne = new Team('Огурчик','team-one');
let teamTwo = new Team('Помідорчик','team-two');

let mapSize = {
    x: 10,
    y: 10,
    sizeX: 1000,
    sizeY: 1000,
};

let mapSet = {
    dotsMidDistX: mapSize.sizeX / (mapSize.x),
    dotsMidDistY: mapSize.sizeY / (mapSize.y),
    dotsDiffX: mapSize.sizeX / (mapSize.x) * 0.5,
    dotsDiffY: mapSize.sizeY / (mapSize.y) * 0.5,
    resources: [
        {name: 'meadow', ico: '', chance: 1},
        {name: 'meadow', ico: '', chance: 1},
        {name: 'wood', ico: 'images/ico/wood.svg', chance: 1},
        {name: 'fish', ico: 'images/ico/fish.svg', chance: .5},
        {name: 'water', ico: '', chance: .5},
        {name: 'mountain', ico: '', chance: .5},
        {name: 'choco', ico: 'images/ico/choco.svg', chance: .1},
        {name: 'wheat', ico: 'images/ico/wheat.svg', chance: 1},
        {name: 'cow', ico: 'images/ico/cow.svg', chance: .7},
        {name: 'coal', ico: 'images/ico/coal.svg', chance: .5},
        {name: 'diamond', ico: 'images/ico/diamond.svg', chance: .1},
        {name: 'gold', ico: 'images/ico/gold.svg', chance: .1},
        {name: 'stone', ico: 'images/ico/stone.svg', chance: .5}
    ],
    resourcesIcoSize: 48,
}

let dots = [];


function randomDist(diff) {
    return Math.random() * diff - diff * 0.5;
}
function randomNumber(max) {
    return Math.floor((Math.random() * max));
}

for(let y = 0; y <= mapSize.y; y++) {
    dots[y] = [];
    for(let x = 0; x <= mapSize.x; x++) {
        let dotX = 0;
        let dotY = 0;
        if (x === 0) {
            dotX  = 0;
        } else if (x === mapSize.x) {
            dotX = mapSize.sizeX;
        } else {
            dotX = Math.round(mapSet.dotsMidDistX * x + randomDist(mapSet.dotsDiffX));
        }
        if (y === 0) {
            dotY = 0;
        } else if (y === mapSize.y) {
            dotY = mapSize.sizeY;
        } else {
            dotY = Math.round(mapSet.dotsMidDistY * y + randomDist(mapSet.dotsDiffY));
        }
        dots[y][x] = [dotX, dotY];
    }
}


let regionCounter = 0;
class Region {
    constructor() {
        this.id = regionCounter++;
        this.owner;
        this.resources = [];
        this.type = 'earth';
        this.style = ['region'];
        this.regionInteractive;
        this.near = {
            topLeft: null,
            top: null,
            topRight: null,
            centerLeft: null,
            centerRight: null,
            bottomLeft: null,
            bottom: null,
            bottomRight: null
        },
        this.coord = [
            [0,0],[0,0],[0,0],[0,0]
        ],
        this.coordRound = {
            dots: [
                [0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]
            ],
            dotsState : [
                0, 0, 0, 0
            ],
            round: {
                rSet: 20,
                r: [this.rSet,this.rSet],
                t: [0, 0, 1],
                d: [0, 0]
            },
        }
        this.middleCoord = [];
    }
}
let regions = [];
let regionsMatrix = [];

for (let y = 0; y < mapSize.y; y++) {
    regionsMatrix.push([]);
    for (let x = 0; x < mapSize.x; x++) {
        regions.push(new Region());
        let z = [
            dots[y][x],
            dots[y][x+1],
            dots[y+1][x+1],
            dots[y+1][x]
        ];
        regions[regions.length - 1].coord = z;
        regions[regions.length - 1].middleCoord = [
            (z[2][0]+z[0][0]+z[3][0]+z[1][0])/4,(z[2][1]+z[0][1]+z[3][1]+z[1][1])/4
        ]
        regions[regions.length - 1].resources.push(mapSet.resources[randomNumber(mapSet.resources.length)]);


        if(regions[regions.length - 1].resources[0].name === 'fish'||regions[regions.length - 1].resources[0].name === 'water') {
            regions[regions.length - 1].style.push('water');
            regions[regions.length - 1].type = 'water';
        } else if(regions[regions.length - 1].resources[0].name === 'coal'||regions[regions.length - 1].resources[0].name === 'gold'||regions[regions.length - 1].resources[0].name === 'mountain') {
            regions[regions.length - 1].style.push('mountain');
            regions[regions.length - 1].type = 'mountain';
        } else if(regions[regions.length - 1].resources[0].name === 'diamond'||regions[regions.length - 1].resources[0].name === 'stone') {
            regions[regions.length - 1].style.push('rock');
            regions[regions.length - 1].type = 'mountain';
        } 

        regionsMatrix[y][x] = regions[regions.length - 1];
    }
}


for (let y = 0; y < mapSize.y; y++) {
    for (let x = 0; x < mapSize.x; x++) {
        regionsMatrix[y][x].near = getElementsArr(y, x, regionsMatrix);
    }
}

    function getElementsArr(i, j, arr) {
        var yIndexes = getIndexes(arr, i);
        var xIndexes = getIndexes(arr[i], j);
        var thisArr = {
          topLeft: yIndexes.prev === 9 || xIndexes.prev === 9 ? false : arr[yIndexes.prev][xIndexes.prev],
          top:  yIndexes.prev === 9 ? false : arr[yIndexes.prev][xIndexes.curr],
          topRight:  yIndexes.prev === 9 || xIndexes.next === 0 ? false : arr[yIndexes.prev][xIndexes.next],
          centerLeft:  xIndexes.prev === 9 ? false : arr[yIndexes.curr][xIndexes.prev],
          centerRight: xIndexes.next === 0 ? false : arr[yIndexes.curr][xIndexes.next],
          bottomLeft:  yIndexes.next === 0 || xIndexes.prev === 9 ? false : arr[yIndexes.next][xIndexes.prev],
          bottom:  yIndexes.next === 0 ? false : arr[yIndexes.next][xIndexes.curr],
          bottomRight: yIndexes.next === 0 || xIndexes.next === 0 ? false : arr[yIndexes.next][xIndexes.next],
        }
        return thisArr;
    }
    function getIndexes(arr, i) {
        let prev = i - 1;
        let next = i + 1;

        if (i == 0) {
          prev = arr.length - 1;
        } else if (i == arr.length - 1) {
          next = 0;
        }

        return {
          prev: prev,
          curr: i,
          next: next};
    }

    regions.forEach(e => {
        e.coordRound.dots = [
            e.coord[0],
            [(e.coord[0][0]+e.coord[1][0])/2, (e.coord[0][1]+e.coord[1][1])/2],
            e.coord[1],
            [(e.coord[1][0]+e.coord[2][0])/2, (e.coord[1][1]+e.coord[2][1])/2],
            e.coord[2],
            [(e.coord[2][0]+e.coord[3][0])/2, (e.coord[2][1]+e.coord[3][1])/2],
            e.coord[3],
            [(e.coord[3][0]+e.coord[0][0])/2, (e.coord[3][1]+e.coord[0][1])/2]
        ]
        e.coordRound.dotsState = [
            dotStateF(e, e.near.centerLeft, e.near.topLeft, e.near.top, 0),
            dotStateF(e, e.near.top, e.near.topRight, e.near.centerRight, 1),
            dotStateF(e, e.near.centerRight, e.near.bottomRight, e.near.bottom, 2),
            dotStateF(e, e.near.bottom, e.near.bottomLeft, e.near.centerLeft, 3)
        ]
    });


function dotStateF(current, firstN, secondN, thirdN, dotNum) {
    let i;
    if (firstN.type != current.type && thirdN.type != current.type && secondN.type) {
        i = 1;
    } else if (dotNum === 0 && secondN.type === current.type) {
        i = 2;
    } else if (dotNum === 1 && secondN.type === current.type) {
        i = 3;
    } else if (dotNum === 2 && secondN.type === current.type) {
        i = 4;
    } else if (dotNum === 3 && secondN.type === current.type) {
        i = 5;
    } 
    //  else if (thirdN.type === current.type && firstN !== false) {
    //     i = 6; 
    // } else if (firstN.type === current.type && thirdN !== false) {
    //     i = 6; 
    // } 
    else {
        i = 0
    }

    if (secondN.type === current.type && current.type === 'water') {
        i = dotNum + 2;
    }

    secondN.type == false ? i = 0: '';


    return i
}

console.log(regions);

let polygonInner, icoInner;
let polygonInnerNew, icoInnerNew;

for(let i = 0; i < regions.length; i++) {
    let pathD = [];
    let counter = 0;
    pathD.push(' M');
    for (let y = 0; y < regions[i].coordRound.dotsState.length; y++) {
        counter === 8 ? counter = 0 : '';
        if (regions[i].coordRound.dotsState[y] === 0) {
            if (y === 0) {
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' L');
                pathD.push(regions[i].coordRound.dots[counter + 1]);
                counter += 2;
            } else {
                pathD.push(' L');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' L');
                pathD.push(regions[i].coordRound.dots[counter+1]);
                counter += 2;
            }
        } else if (regions[i].coordRound.dotsState[y] === 1) {
            if (y === 0) {
                pathD.push(regions[i].coordRound.dots[7]);
                pathD.push(' Q');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' ');
                pathD.push(regions[i].coordRound.dots[counter + 1]);
                counter += 2;
            } else {
                pathD.push(' Q');
                pathD.push(regions[i].coordRound.dots[counter]);
                pathD.push(' ');
                pathD.push(regions[i].coordRound.dots[counter + 1]);
                counter += 2;
            }

        } else if (regions[i].coordRound.dotsState[y] === 2) {
            pathD.push(regions[i].coordRound.dots[counter]);
            pathD.push(' L');
            pathD.push(regions[i].near.topLeft.coordRound.dots[3]);
            pathD.push(' Q');
            pathD.push(regions[i].coordRound.dots[counter]);
            pathD.push(' ');
            pathD.push(regions[i].coordRound.dots[counter + 1]);
            counter += 2;
        } else if (regions[i].coordRound.dotsState[y] === 3) {
            pathD.push(' Q');
            pathD.push(regions[i].coordRound.dots[counter]);
            pathD.push(' ');
            pathD.push(regions[i].near.top.coordRound.dots[3]);
            pathD.push(' L');
            pathD.push(regions[i].coordRound.dots[counter]);
            pathD.push(' L');
            pathD.push(regions[i].coordRound.dots[counter + 1]);
            counter += 2;

        } else if (regions[i].coordRound.dotsState[y] === 4) {
            pathD.push(' L');
            pathD.push(regions[i].coordRound.dots[counter]);
            pathD.push(' L');
            pathD.push(regions[i].near.bottom.coordRound.dots[3]);
            pathD.push(' Q');
            pathD.push(regions[i].coordRound.dots[counter]);
            pathD.push(' ');
            pathD.push(regions[i].coordRound.dots[counter + 1]);
            counter += 2;
        } else if (regions[i].coordRound.dotsState[y] === 5) {
            pathD.push(' Q');
            pathD.push(regions[i].coordRound.dots[counter]);
            pathD.push(' ');
            pathD.push(regions[i].near.bottom.coordRound.dots[7]);
            pathD.push(' L');
            pathD.push(regions[i].coordRound.dots[counter]);
            pathD.push(' L');
            pathD.push(regions[i].coordRound.dots[counter+1]);
            counter += 2;
        } else if (regions[i].coordRound.dotsState[y] === 6) {
            y === 0 ? pathD.push(regions[i].coordRound.dots[counter]) : '';
            pathD.push(' Q');
            pathD.push(regions[i].coordRound.dots[counter]);
            pathD.push(' ');
            if (y === 0) {
                pathD.push(regions[i].near.top.coordRound.dots[7]) ;
            } else if (y === 1) {
                pathD.push(regions[i].near.centerRight.coordRound.dots[1])
            } else if (y === 2) {
                pathD.push(regions[i].near.bottom.coordRound.dots[3]) 
            } else if (y === 3) {
                pathD.push(regions[i].near.centerLeft.coordRound.dots[5])
            }
            pathD.push(' Q');
            pathD.push(regions[i].coordRound.dots[counter]);
            pathD.push(' ');
            pathD.push(regions[i].coordRound.dots[counter+1]);
            counter += 2;
        }
       
        
    }

    polygonInnerNew += `<path d = " ${pathD.join('')} Z" class="${regions[i].style.join(' ')}"/>`;
    icoInnerNew += `<image xlink:href="${regions[i].resources[0].ico}" x="${regions[i].middleCoord[0]-mapSet.resourcesIcoSize/2}" y="${regions[i].middleCoord[1]-mapSet.resourcesIcoSize/2}px" height="${mapSet.resourcesIcoSize}px" width="${mapSet.resourcesIcoSize}px"/>`;
    pathD = [];

}

document.querySelector('#map').innerHTML = polygonInnerNew + icoInnerNew;

for(let i = 0; i < regions.length; i++) {
    let pathD = [];
    for (let y = 0; y < regions[i].coord.length; y++){
        y === 0 ? '': pathD.push(' L') ;
        pathD.push(regions[i].coord[y]);

        // pathD.push('A3,3 0 0,0 0,0 ');
    }
    polygonInner += `<path d = "M ${pathD.join('')} Z"  class="${regions[i].style.join(' ')} region-interactive"/>`;
    icoInner += `<image xlink:href="images/ico/plus.svg" x="${regions[i].middleCoord[0]-mapSet.resourcesIcoSize/2}" y="${regions[i].middleCoord[1]-mapSet.resourcesIcoSize/2}px" class="region_plus hidden region-ico-interactive" height="${mapSet.resourcesIcoSize}px" width="${mapSet.resourcesIcoSize}px"/>`;
    pathD = [];
}

document.querySelector('#map_regions').innerHTML = icoInner + polygonInner ;



let regionInteractive = document.querySelectorAll('.region-interactive');
let regionIcoInteractive = document.querySelectorAll('.region-ico-interactive');
let regionInteractiveCounter = 0;

regionInteractive.forEach((e) => {
    e.ico = regionIcoInteractive[regionInteractiveCounter];
    e.region = regions[regionInteractiveCounter];
    regions[regionInteractiveCounter].regionInteractive = e;
    e.active = false;
    e.owner = false;
    e.near = {
        top: e.region.near.top ? e.region.near.top.id : null,
        right: e.region.near.centerRight ? e.region.near.centerRight.id : null,
        bottom: e.region.near.bottom ? e.region.near.bottom.id : null,
        left: e.region.near.centerLeft ? e.region.near.centerLeft.id : null

    }
    e.id = e.region.id
    e.changeActive = function(team) {
        e.active === false ? e.active = true: e.active = false;
        e.owner === false ?  e.owner = team : e.owner = false;
        e.region.owner === team;
        if (e.near.left != null && regionInteractive[e.near.left].active == false) {
            regionIcoInteractive[e.near.left].classList.toggle('hidden');
            regionInteractive[e.near.left].classList.toggle('active');
        }
        if (e.near.top != null && regionInteractive[e.near.top].active == false) {
            regionIcoInteractive[e.near.top].classList.toggle('hidden');
            regionInteractive[e.near.top].classList.toggle('active');
        }
        if (e.near.right != null && regionInteractive[e.near.right].active == false) {
            regionIcoInteractive[e.near.right].classList.toggle('hidden');
            regionInteractive[e.near.right].classList.toggle('active');
        }
        if (e.near.bottom != null && regionInteractive[e.near.bottom].active == false) {
            regionIcoInteractive[e.near.bottom].classList.toggle('hidden');
            regionInteractive[e.near.bottom].classList.toggle('active');
        }
        team.regionOwner.includes(e.region) ? team.regionOwner.splice(e.region) : team.regionOwner.push(e.region);
        e.classList.toggle(team.regionStyleName);
        
    };
    e.addEventListener('mouseover', (i) => {
        e.classList.toggle('hover');
    })
    e.addEventListener('mouseout', (i) => {
        e.classList.toggle('hover');
    })

    regionInteractiveCounter++;
})

regionInteractive[0].changeActive(game.teams.all[0]);
regionInteractive[99].changeActive(game.teams.all[1]);


