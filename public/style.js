


function run(){


	var x =$("#filter :selected").text();


	if(x=="All"){
		
		$(".pubs").removeClass("d-none")
		

	}

	if(x=="Journal"){
		
		$(".pubs").addClass("d-none")
		$(".Journal").removeClass("d-none")
	

	}
	if(x=="Conference"){
		
		$(".pubs").addClass("d-none")
		$(".Conference").removeClass("d-none")
	

	}
	if(x=="Article"){
		
		$(".pubs").addClass("d-none")
		$(".Article").removeClass("d-none")
	

	}if(x=="Book"){
		
		$(".pubs").addClass("d-none")
		$(".Book").removeClass("d-none")
	

	}
	if(x=="Chapter"){
		
		$(".pubs").addClass("d-none")
		$(".Chapter").removeClass("d-none")
	

	}
	if(x=="Patent"){
		
		$(".pubs").addClass("d-none")
		$(".Patent").removeClass("d-none")
	

	}
	if(x=="Web Page"){
		
		$(".pubs").addClass("d-none")
		$(".Web page").removeClass("d-none")
	

	}
	if(x=="Newspaper"){
		
		$(".pubs").addClass("d-none")
		$(".Newspaper").removeClass("d-none")
	

	}
	if(x=="Other"){
		
		$(".pubs").addClass("d-none")
		$(".Other").removeClass("d-none")
	

	}
	
	
}
