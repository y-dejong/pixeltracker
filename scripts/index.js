var pixeltable = document.getElementById("pixeltable");

function addPixel() {
	//TODO
}

function getPixels() {

	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "/getPixels", false);

	xhttp.onload = function() {
		var rows = JSON.parse(this.responseText);
		var rowtext;
		console.log(rows);
		for(var i = 0; i < rows.length; i++) {
			rowtext = "<tr>";
			rowtext += "<td>" + rows[i].id + "</td>";
			rowtext += "<td>" + rows[i].name + "</td>";
			rowtext += "<td>" + rows[i].dateCreated + "</td>";
			rowtext += "<td>" + rows[i].dateAccessed + "</td>";
			rowtext += "<td>" + rows[i].customUrl + "</td>";
			pixeltable.innerHTML += rowtext;
		}

	};
	xhttp.send();
}

getPixels();
