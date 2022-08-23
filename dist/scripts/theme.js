// Animation variables...
var ta_canvas = null;
var ta_context = null;
var ta_resize_observer = null;
var raindropsArray = [];

// SMF main jquery one-time ready function...
$(function() {
	$('ul.dropmenu, ul.quickbuttons').superfish({delay : 250, speed: 100, sensitivity : 8, interval : 50, timeout : 1});

	// tooltips
	$('.preview').SMFtooltip();

	// find all nested linked images and turn off the border
	$('a.bbc_link img.bbc_img').parent().css('border', '0');

	// Animation setup...
	ta_canvas = document.getElementById("canvas-body");
	ta_canvas.width = outerWidth;
	ta_canvas.height = outerHeight;
	ta_context = ta_canvas.getContext("2d");
	ta_context.fillStyle = "rgba(1, 1, 47, 1)";
	ta_context.fillRect(0, 0, ta_canvas.width, ta_canvas.height);

	// If user has opted out of animations, then don't do 'em...
	if (typeof bsc_disable_anim === "undefined")
		anim();

	// Allow coloring of checkbox & radio button backgrounds...
	// This label after all checkboxes guarantees that *ALL* checkboxes 
	// are findable and changeable by .css, and selectable as well.
	// If no ID, gotta create one.
	$("input:checkbox, input:radio").each(function() {
		let $id = this.id;
		if ($id == "")
		{
			$id = "crid_" + Math.random().toString().substring(2, 15) + "_" + Math.random().toString().substring(2, 15);
			this.id = $id;
		}
		$("<label for='" + $id + "'></label>").insertAfter(this);
	});

	// Add a listener for the color pickers, for real-time display...
	$('[id^=cc_]').on('input', function(e) {
		let input_type = e.target.type;
		let color_var = "--" + e.target.id;
		let new_color = e.target.value;
		// Document level = :root...
		if ((input_type === 'color') && (typeof new_color !== undefined))
			document.documentElement.style.setProperty(color_var, new_color);
	});

	// SMF dynamically alters height frequently, so the true doc height isn't always visible to js.
	// This deals with *all* dynamic doc size changes efficiently, including many missed by resize events.
	// And no reload() calls are necessary, so it's fast...  Required for animation.
	ta_resize_observer = new ResizeObserver(entries => {
		for (let entry of entries) {
			ta_canvas.width = entry.contentRect.width;
			ta_canvas.height = entry.contentRect.width*outerHeight/outerWidth;
			ta_canvas.style.width = entry.contentRect.width + "px";
			ta_canvas.style.height = entry.contentRect.width*outerHeight/outerWidth + "px";
			generateRaindrops(127);
			ta_context.fillStyle = "rgba(1, 1, 47, 1)";
			ta_context.fillRect(0, 0, ta_canvas.width, ta_canvas.height);
		}
	});
	ta_resize_observer.observe(document.body)
});

// Propagate css variables & values into the sceditor iframe document when they hit the wysiwyg button.
// This enables you to manipulate sceditor colors on Current Theme screen.
$(window).on("load", function() {
	$("div.roundframe").on("click", function(e) {
		// User clicked on wysiwyg div...
		if (e.target.parentElement.className !== "sceditor-button sceditor-button-source")
			return;
		let $style = getComputedStyle(document.documentElement);
		let $vars = bsc_css_vars;
		let $frame = $("iframe").contents();
		$vars.forEach(($var) => {
			$frame.find(":root").css($var, $style.getPropertyValue($var));
		});
	});
});

// Propagate css variables into svg images, so the svg palette is kept in sync with the theme.
// For this to work, svg must be loaded via object elements, and the svg itself must use the same 
// variable names in its own internal style sheet.
$(window).on("load", function() {
	$("object[type='image/svg+xml']").each(function() {
		// Get this doc's vars from root...
		let $style = getComputedStyle(document.documentElement);
		let $vars = bsc_css_vars;
		let $svg_doc = this.contentDocument;
		// If no doc to update, move on...
		if ($svg_doc === null)
			return;
		$vars.forEach(($var) => {
			$svg_doc.documentElement.style.setProperty($var, $style.getPropertyValue($var));
		});
		// Substitute forum name where asked...
		$(".smf_mbname_text", $svg_doc).each(function() {
			this.textContent = smf_mbname_text;
		});
	});
});

// Toggles the element height and width styles of an image.
function smc_toggleImageDimensions()
{
	$('.postarea .bbc_img.resized').each(function(index, item)
	{
		$(item).click(function(e)
		{
			$(item).toggleClass('original_size');
		});
	});
}

// Add a load event for the function above.
addLoadEvent(smc_toggleImageDimensions);

function smf_addButton(stripId, image, options)
{
	$('#' + stripId).append(
		'<a href="' + options.sUrl + '" class="button last" ' + ('sCustom' in options ? options.sCustom : '') + ' ' + ('sId' in options ? ' id="' + options.sId + '_text"' : '') + '>'
			+ options.sText +
		'</a>'
	);
}

// Animation functions...
// Animation functions...
// Animation functions...

function generateColor() {
  let hexSet = "0123456789ABCDEF";
  let finalHexString = "#0A0A";
  for (let i = 0; i < 2; i++) {
    finalHexString += hexSet[Math.ceil(Math.random() * 9)];
  }
  return finalHexString;
}

function generateRaindrops(amount)
{
	for (let i = 0; i < amount; i++)
	{
		raindropsArray[i] = new Raindrop(
			this.x = Math.random() * ta_canvas.width,
			this.y = Math.random() * ta_canvas.height,
			this.size = Math.random() * ta_canvas.width / 25,
			this.color = generateColor(),
			this.birthdate = Date.now() - (Math.random() * 10000)
		);
	}
}

function Raindrop(x, y, size, color, birthdate)
{
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
	this.birthdate = birthdate;

	this.drop = function ()
	{
		if (Date.now() - this.birthdate > 10000)
		{
			ta_context.beginPath();
			ta_context.fillStyle = this.color;
			ta_context.arc(this.x, this.y, this.size, 0, Math.PI*2);
			ta_context.fill();

			this.x = Math.random() * ta_canvas.width;
			this.y = Math.random() * ta_canvas.height;
			this.size = Math.random() * ta_canvas.width / 25;
			this.color = generateColor();
			this.birthdate = Date.now() - (Math.random() * 10000);
		}
	};
}

function anim()
{
	// If ta_context is null, theme is changing due to logon/logoff, etc.
	// Just exit gracefully...
	if (ta_context === null)
		return;

	requestAnimationFrame(anim);

	ta_context.fillStyle = "rgba(1, 1, 47, 0.006)";
	ta_context.fillRect(0, 0, ta_canvas.width, ta_canvas.height);

	raindropsArray.forEach((raindrop) => raindrop.drop());
}
