let $ = function(id){return document.getElementById(id)};
let lastGroup=-1;
let timer=0;
let bulletDiameter=6.5;
let hits =[]
let groups= []
let micDistX=1000;
let micDistY=1000;
let canvas;
let isCalibrating=false;
let calibrationX=0;
let calibrationY=0;
let autoGroup=5;

function setTargetImage(url){
    fabric.Image.fromURL(url, function(image) {
        image.alt = '';
        image.selectable=false;
        canvas.insertAt(image,0,true);
        //console.log('Target set to: '+url)
        calibrationX=0;
        calibrationY=0;
      }, {
        crossOrigin: 'Annoymous',
        originX:'center',
        originY:'center',
        top:micDistY/2,
        left:micDistX/2
    });
}

function calibrateTarget(){
    isCalibrating=!isCalibrating;
    //console.log('calibrateTarget: '+isCalibrating)
    if(isCalibrating){
        $('calibrateButton').innerHTML='Stop calibration';
    }else{
        $('calibrateButton').innerHTML='Calibrate';
    }
}

function onChangeSelectTarget(){
    setTargetImage($('selectTarget').value)
}

function updateHits(){
    hits.forEach(function (hit){
        if(hit.group==-2){
            canvas.item(hit.item).set('fill','rgba(0,0,0,0.1)');
            canvas.item(hit.item).set('stroke','rgba(255,255,255,0.1)');
        }else if(hit.group==-1){
            canvas.item(hit.item).set('fill','rgba(0,0,0,0.2)');
            canvas.item(hit.item).set('stroke','rgba(255,255,255,0.2)');
        }else if(hit.group==$('showGroup').value){
            canvas.item(hit.item).set('fill','rgba(0,0,0,1)');
            canvas.item(hit.item).set('stroke','rgba(255,255,255,1)');
        }else{
            canvas.item(hit.item).set('fill','rgba(0,0,0,0.5)');
            canvas.item(hit.item).set('stroke','rgba(255,255,255,0.5)');
        }
    });
}

function selectGroup(id){
    //console.log('selectGroup('+id+')')
    $('showGroup').value=id;
    var text='';

    if(groups[id].hits>0){
        text+= 'Avg: '+groups[id].avg.toFixed(1)+'m/s<br>';
        text+= 'ES: '+groups[id].es.toFixed(1)+'m/s<br>';
        text+= 'SD: '+groups[id].sd.toFixed(1)+'m/s<br>';
        text+= 'Size: '+groups[id].size.toFixed(0)+'mm<br>';


 /*       hits.forEach(function (hit){
            if(hit.group==id){
                text+='Shot#'+(hit.id+1)+' '+hit.v+'m/s<br>';
            }
        });*/
    }else{
        text+='No shots!';
    }
    $('groupInfo').innerHTML=text;
   if(groups[id].hits>0){
        canvas.item(8).set('left',groups[id].left);
        canvas.item(8).set('width',groups[id].width);
        canvas.item(8).set('top',groups[id].top);
        canvas.item(8).set('height',groups[id].height);  
        canvas.item(8).set('stroke','rgba(0,0,255,0.5)');
    }else{
        canvas.item(8).set('stroke','rgba(0,0,255,0)');
    }
    updateHits();
    canvas.renderAll();
}
function onChangeShowGroup(){
    selectGroup($('showGroup').value);
}
function updateGroup(id){
    //console.log('updateGroup('+id+')');
    groups[id].left=99999999999;
    groups[id].right=-99999999999;
    groups[id].top=99999999999;
    groups[id].bottom=-99999999999;
    groups[id].hits=0;

    var sum=0;
    var sdsum=0;
    var maxv=0;
    var minv=999999;
    var maxsize=0;
    var groupHits=[]
    var id1=-1;
    var id2=-1;
    hits.forEach(function (hit){
        if(hit.group==id){
            groupHits.push(hit);
            groups[id].hits++;
            groups[id].left=Math.min(groups[id].left,hit.x-bulletDiameter/2);
            groups[id].right=Math.max(groups[id].right,hit.x+bulletDiameter/2);
            groups[id].top=Math.min(groups[id].top,hit.y-bulletDiameter/2);
            groups[id].bottom=Math.max(groups[id].bottom,hit.y+bulletDiameter/2);
            groups[id].width=Math.abs(groups[id].left-groups[id].right);
            groups[id].height=Math.abs(groups[id].top-groups[id].bottom);
            sum+=hit.v;
            maxv=Math.max(maxv,hit.v);
            minv=Math.min(minv,hit.v);
        }
    });
    console.log(groupHits)

    if(groups[id].hits>0){
        groups[id].es=maxv-minv;
        groups[id].avg=sum/groups[id].hits;

        //JGr....funkar det här verkligen ??
        if(groupHits.length>1){
            for(let i=0;i<groupHits.length-1;i++){
                for(let j=i+1;j<groupHits.length;j++){
                    size=Math.abs(Math.sqrt(Math.pow(groupHits[i].x-groupHits[j].x,2)+Math.pow(groupHits[i].y-groupHits[j].y,2)));
                    if(size>maxsize){
                        id1=i;
                        id2=j;
                        maxsize=size;
                    }                
                }
            }
        }
        groups[id].size=maxsize;
        groups[id].id1=id1;
        groups[id].id2=id2;
        
        //JGr....funkar det här verkligen ??
        for(let i=0;i<groupHits.length;i++){
            sdsum+=Math.pow(groupHits[i].v-groups[id].avg,2);
        }
        groups[id].sd=sdsum/groups[id].hits;

        console.log(groups[id]);
    }

 /*   if(groups[id].hits>0){
        console.log(groups[id])
        canvas.item(groups[id].item).set('left',groups[id].left);
        canvas.item(groups[id].item).set('width',groups[id].width);
        canvas.item(groups[id].item).set('top',groups[id].top);
        canvas.item(groups[id].item).set('height',groups[id].height);  
        canvas.item(groups[id].item).set('stroke','#FF0000');  
        console.log(canvas.item(groups[id].item).get('left'))
        canvas.renderAll();
    }*/
}

function selectHit(id,selected){
    if(selected){
        canvas.item(6).set('left',hits[id].x);
        canvas.item(6).set('top',hits[id].y);
        canvas.item(6).set('fill','#FFFF00');
        $('selectShot').value=id;
        $('selectGroup').value=hits[id].group;
    }else{
        canvas.item(6).set('fill','rgba(0,0,0,0)');
    }
}

function onChangeSelectShot(){
    selectHit($('selectShot').value,true);
}

function onChangeSelectGroup(){
    var oldGroupId=hits[$('selectShot').value].group;
    var newGroupId=$('selectGroup').value;
    hits[$('selectShot').value].group=newGroupId;
    //console.log('Old group: '+oldGroupId);
    //console.log('New group: '+newGroupId);
    if(oldGroupId>=0) updateGroup(oldGroupId);
    if(newGroupId>=0) updateGroup(newGroupId);
    selectGroup($('showGroup').value);
}

function addGroup(){
    //console.log('addGroup')
    var canvasItems=canvas.getObjects().length;

    lastGroup=groups.length;

    var group={id:lastGroup,left:'0',right:'0',top:'0',bottom:'0',item:canvasItems,text:'Group#'+(lastGroup+1),hits:'0'}
    groups.push(group);

    var option = document.createElement('option');
    option.text=group.text;
    option.value=group.id;
    $('selectGroup').add(option)
    var option = document.createElement('option');
    option.text=group.text;
    option.value=group.id;
    $('showGroup').add(option)
    updateGroup(group.id);
    selectGroup(group.id);

}

function animateHit(){
    var radius=canvas.item(7).get('radius')-1;
    if(radius>4){
        canvas.item(7).set('radius', radius);
        timer=setTimeout(animateHit,100);
    }else{
        canvas.item(7).set('stroke','rgba(0,0,0,0)');
        timer=0;
    }
    canvas.renderAll();
}

function addHit(hit){
    var canvasItems=canvas.getObjects().length;
    hit.group=lastGroup;
    hit.item=canvasItems;
    var hitMarker= new fabric.Circle({top: hit.y, left: hit.x, radius: bulletDiameter/2, stroke:'#FFFFFF', strokeWidth:'1',fill: '#000000', originX: 'center', originY: 'center', lockMovementX: 'true', lockMovementY: 'true', lockRotation: 'true', lockScalingX:'true', lockScalingY:'true', id:hit.id});
    hitMarker.hasControls=false;
    hitMarker.hasBorders=false;
    var hitMarkerText = new fabric.Textbox(''+(hit.id+1), {left: hit.x, top: hit.y, stroke:'#333333', fontSize: bulletDiameter, originX: 'center', originY: 'center', id:hit.id});
    hitMarkerText.hasControls=false;
    hitMarkerText.hasBorders=false;
    canvas.add(hitMarker);//, hitMarkerText);
    hits.push(hit)

    canvas.item(7).set('left',hit.x);
    canvas.item(7).set('top',hit.y);
    canvas.item(7).set('radius', '40');
    canvas.item(7).set('stroke','cyan');

    canvas.item(5).set('left',hit.x);
    canvas.item(5).set('top',hit.y);
    canvas.item(5).set('fill','rgba(0,255,0,0.5');

    canvas.renderAll();

    if(timer!=0){
        clearTimeout(timer);
    }
    timer=setTimeout(animateHit,1000);
    var option = document.createElement('option');
    option.text='Shot#'+(hit.id+1)+' '+hit.v+'m/s';
    option.value=hit.id;
    $('selectShot').add(option);
    updateGroup(hit.group);
    if($('showGroup').value==hit.group){
        selectGroup(hit.group)
    }
    if(groups[hit.group].hits>=autoGroup){
        addGroup();
    }
}

(function () { //Pure canvas stuff....
    
    function resizeCanvas() {
        canvas.setHeight(window.innerHeight);
        canvas.setWidth(window.innerWidth);
        canvas.renderAll();
    }
 
    function debug(text){
        canvas.item(5).set('text',text);
        canvas.renderAll();
    }

    canvas = this.__canvas = new fabric.Canvas('canvas',{
        width:80,
        height:80,
        backgroundColor: '#777777',
        selection: false
    });

    canvas.on({
        'selection:created':function(opt){
            selectHit(opt.selected[0].id,true);
            canvas.requestRenderAll();
        },
        'selection:updated':function(opt){
            selectHit(opt.selected[0].id,true);
            canvas.requestRenderAll();
        },
        'before:selection:cleared': function(opt){
            selectHit(0,false);
            canvas.requestRenderAll();
        },
        'mouse:wheel': function(opt) {
            var delta = opt.e.deltaY;
            var zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        },
        'mouse:down': function(opt) {
            this.isDragging = true;
            this.selection = false;
            var e=opt.e;
            if(opt.e.type=='touchstart'){
                e=opt.e.touches[0];
            }
            this.lastPosX = e.clientX;
            this.lastPosY = e.clientY;
        },
        'mouse:move': function(opt) {
            var e=opt.e;
            if(isCalibrating && this.isDragging){
                if(opt.e.type=='touchmove'){
                    e=opt.e.touches[0];
                    if(opt.e.touches.length==1){
                        e=opt.e.touches[0];
                    }
                }
                calibrationX+=(e.clientX-this.lastPosX)/canvas.getZoom();
                calibrationY+=(e.clientY-this.lastPosY)/canvas.getZoom();
                canvas.item(0).set('left',micDistX/2+calibrationX);
                canvas.item(0).set('top',micDistY/2+calibrationY);
                this.lastPosX = e.clientX;
                this.lastPosY = e.clientY;
                canvas.requestRenderAll();
            }else{
                if(opt.e.type=='touchmove'){
                    e=opt.e.touches[0];
                    if(opt.e.touches.length==1){
                        e=opt.e.touches[0];
                    }else if(opt.e.touches.length==2){
                        pinchDist=Math.sqrt((opt.e.touches[0].clientX-opt.e.touches[1].clientX)**2+(opt.e.touches[0].clientY-opt.e.touches[1].clientY)**2);
                        e.clientX=(opt.e.touches[0].clientX+opt.e.touches[1].clientX)/2;
                        e.clientY=(opt.e.touches[0].clientY+opt.e.touches[1].clientY)/2;
                        if(!this.isPinching){
                            this.startPinch=pinchDist;
                            this.startZoom=canvas.getZoom();
                        }
                        this.isPinching=true;
                        var zoom = this.startZoom*(pinchDist/this.startPinch);
                        if (zoom > 20) zoom = 20;
                        if (zoom < 0.01) zoom = 0.01;
                        canvas.zoomToPoint({ x: e.clientX, y: e.clientY }, zoom);
                        canvas.renderAll();
                    }
                }
                if (this.isDragging) {
                    this.viewportTransform[4] += e.clientX - this.lastPosX;
                    this.viewportTransform[5] += e.clientY - this.lastPosY;
                    this.requestRenderAll();
                    this.lastPosX = e.clientX;
                    this.lastPosY = e.clientY;
                }
            }
        },
        'mouse:up': function(opt) {
            this.setViewportTransform(this.viewportTransform);
            this.isDragging = false;
            this.selection = true;
            this.isPinching=false;
        }
    });
 
    

    var target = new fabric.Rect({top: micDistY/2, left: micDistX/2, width: micDistX, height: micDistY, fill: 'white', originX: 'center', originY: 'center'});
    target.selectable=false;

    var red = new fabric.Circle({top: 0, left: 0, radius: 20, fill: 'red', originX: 'center', originY: 'center'});
    red.selectable=false;
    var green = new fabric.Circle({top: 0, left: micDistX, radius: 20, fill: 'green', originX: 'center', originY: 'center'});
    green.selectable=false;
    var blue = new fabric.Circle({top: micDistY, left: 0, radius: 20, fill: 'blue', originX: 'center', originY: 'center'});
    blue.selectable=false;
    var yellow = new fabric.Circle({top: micDistY, left: micDistX, radius: 20, fill: 'yellow', originX: 'center', originY: 'center'});
    yellow.selectable=false;

    var marker = new fabric.Circle({top: 0, left: 0, radius: 40, stroke: 'rgba(0,0,0,0)', strokeWidth: '5', fill: 'rgba(0,0,0,0)', originX: 'center', originY: 'center'});
    marker.selectable=false;

    var lastShot = new fabric.Circle({top: 0, left: 0, radius: bulletDiameter/2+5, fill: 'rgba(0,0,0,0)', originX: 'center', originY: 'center'});
    lastShot.selectable=false;

    var selectedShot = new fabric.Circle({top: 0, left: 0, radius: bulletDiameter/2+5, fill: 'rgba(0,0,0,0)', originX: 'center', originY: 'center'});
    selectedShot.selectable=false;
    
    //var groupMarker = new fabric.Rect({top: 0, left:0, width: 1, height: 1, stroke:'rgba(255,0,0,0.5)', strokeWidth:'5', fill: 'rgba(0,0,0,0)',originX:'left', originY:'top'});
    var groupMarker = new fabric.Rect({top: 0, left: 0, width: 10, height: 10, fill: 'rgba(0,0,0,0)', originX: 'left', originY: 'top'});
    groupMarker.selectable=false;

    canvas.add(target,red, blue, green, yellow, lastShot, selectedShot, marker,groupMarker)


    fabric.Object.prototype.transparentCorners = false;
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    zoomx =window.innerWidth/micDistX;
    zoomy=(window.innerHeight)/micDistY;
    zoom=Math.min(zoomx,zoomy);
    canvas.zoomToPoint({x: 0, y: 0},zoom)

    console.log('Exiting: ()');
})();

addGroup();
updateGroup(0);
selectGroup(0);
setTargetImage('/img/1.svg');
setInterval(async function(){
    const response = await fetch('./data.json');
    const json = await response.json();
    if(json.hits.length>hits.length){
        for(var i=hits.length;i<json.hits.length;i++){
            hit=json.hits[i];
            addHit(hit)
        }
    }
    canvas.renderAll();
}, 1000);  