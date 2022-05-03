//selecting all required elements
const dropArea = document.querySelector(".form"),
dragText = dropArea.querySelector("header"),
button = dropArea.querySelector("button"),
input = dropArea.querySelector("input");
let file; //this is a global variable and we'll use it inside multiple functions

button.onclick = ()=>{
    input.click(); //if user click on the button then the input also clicked
}

input.addEventListener("change", function(){
    //getting user select file and [0] this means if user select multiple files then we'll select only the first one
    file = this.files[0];
    dropArea.classList.add("active");
    showFile(); //calling function
});


//If user Drag File Over DropArea
dropArea.addEventListener("dragover", (event)=>{
    event.preventDefault(); //preventing from default behaviour
    dropArea.classList.add("active");
    dragText.textContent = "Release to Upload File";
});

//If user leave dragged File from DropArea
dropArea.addEventListener("dragleave", ()=>{
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
});

//If user drop File on DropArea
dropArea.addEventListener("drop", (event)=>{
    event.preventDefault(); //preventing from default behaviour
    //getting user select file and [0] this means if user select multiple files then we'll select only the first one
    file = event.dataTransfer.files[0];
    // showFile(); //calling function
    // handleFileSelect();
    manageFile();
});

function manageFile(){
    let fileType = file.type; //getting selected file type
    let validExtensions = ["text/csv"];
    console.warn(fileType)
    if(validExtensions.includes(fileType)){ //if user selected file is a csv
    let fileReader = new FileReader(); //creating new FileReader object
    fileReader.onload = ()=>{
        // let fileURL = fileReader.result; //passing user file source in fileURL variable
        // UNCOMMENT THIS BELOW LINE. I GOT AN ERROR WHILE UPLOADING THIS POST SO I COMMENTED IT
        // let imgTag = `<img src="${fileURL}" alt="image">`; //creating an img tag and passing user selected file source inside src attribute
        // dropArea.innerHTML = imgTag; //adding that created img tag inside dropArea container
        const csvData = fileReader.result;
        const csvContent = "data:text/csv;charset=utf-8,"+csvData;
        drawPlow(csvContent)
    }
    fileReader.readAsDataURL(file);
    }else{
    alert("This is not a CSV File!");
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
    }
}
function handleFileSelect(evt) {
    // evt.preventDefault();
    let files = evt.target.files; // FileList object

    // use the 1st file from the list
    let f = files[0];
    
    let reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            const csvData = e.target.result;
            const csvContent = "data:text/csv;charset=utf-8,"+csvData;
            drawPlow(csvContent)
        };
    })(f);
    
    reader.readAsBinaryString(f);
}
document.getElementById('upload').addEventListener('change', handleFileSelect, false);

plotID = 0;
function drawPlow(file) {
    plotID++;
    document.getElementById('plotDiv'+(plotID-1)).remove();
    const newDiv = document.createElement("div");
    newDiv.id = 'plotDiv'+plotID;
    document.body.appendChild(newDiv);
    Plotly.d3.csv(file, function (err, data) {
        var lookup = {};
        function getData(time, sender) {
            var byTime, trace;
            if (!(byTime = lookup[time])) {;
            byTime = lookup[time] = {};
            }
            if (!(trace = byTime[sender])) {
                trace = byTime[sender] = {
                    x: [],
                    y: [],
                    id: [],
                    text: [],
                    marker: {size: []}
                };
            }
            return trace;
        }

        let yTitle = 'Voltage';
        let yRange = [-80, -30];
        if ('voltage' in data[0]) {
            console.log('voltage plot')
            console.log(data)
            for (var i = 0; i < data.length; i++) {
                var datum = data[i];
                var trace = getData(datum.time, datum.sender);
                trace.text.push(datum.sender);
                trace.id.push(datum.sender);
                trace.x.push(datum.sender);
                trace.y.push(datum.voltage);
                trace.marker.size.push(100);
                if (i==data.length-1) {
                    console.log(trace)
                }
            }
        } else {
            console.log('spikes plot')
            console.log(data)
            yRange = [0, 500];
            yTitle = 'Neuron ID'
            for (var i = 0; i < data.length; i++) {
                var datum = data[i];
                var trace = getData(datum.time, datum.sender);
                trace.text = [datum.sender];
                trace.id = [datum.sender];
                trace.x = [datum.sender];
                trace.y = [datum.sender];
                trace.marker.size = [100];
                if (i==data.length-1) {
                    console.log(trace)
                }
            }
        }

        var times = Object.keys(lookup);
        var firstTime = lookup[times[0]];
        var senders = Object.keys(firstTime);

        var traces = [];
        for (i = 0; i < senders.length; i++) {
            var data = firstTime[senders[i]];
            traces.push({
            name: senders[i],
            x: data.x.slice(),
            y: data.y.slice(),
            id: data.id.slice(),
            text: data.text.slice(),
            mode: 'markers',
            marker: {
                size: data.marker.size.slice(),
                sizemode: 'area',
                sizeref: 1
            }
            });
        }

        var frames = [];
        for (i = 0; i < times.length; i++) {
            frames.push({
                name: times[i],
                data: senders.map(function (sender) {
                    return getData(times[i], sender);
                })
            })
        }
            
        var sliderSteps = [];
        for (i = 0; i < times.length; i++) {
            sliderSteps.push({
                method: 'animate',
                label: times[i],
                args: [[times[i]], {
                    mode: 'immediate',
                    transition: {duration: 300},
                    frame: {duration: 300, redraw: true},
                }]
            });
        }
        var layout = {
            height: 700,
            xaxis: {
                title: 'Neuron ID',
            },
            yaxis: {
                title: yTitle,
                range: yRange
            },
            hovermode: 'closest',
            updatemenus: [{
                x: 0,
                y: 0,
                yanchor: 'top',
                xanchor: 'left',
                showactive: false,
                direction: 'left',
                type: 'buttons',
                pad: {t: 87, r: 10},
                buttons: [{
                    method: 'animate',
                    args: [null, {
                        mode: 'immediate',
                        fromcurrent: true,
                        transition: {duration: 300},
                        frame: {duration: 500, redraw: true}
                    }],
                    label: 'Play'
                }, {
                    method: 'animate',
                    args: [[null], {
                        mode: 'immediate',
                        transition: {duration: 0},
                        frame: {duration: 0, redraw: true}
                    }],
                    label: 'Pause'
                }]
            }],
            sliders: [{
                pad: {l: 130, t: 55},
                currentvalue: {
                    visible: true,
                    prefix: 'Time:',
                    xanchor: 'right',
                    font: {size: 20, color: '#666'}
                },
                steps: sliderSteps
            }]
        };
        
        Plotly.plot('plotDiv'+plotID, {
            data: traces,
            layout: layout,
            config: {showSendToCloud:true},
            frames: frames,
        });
    });
}