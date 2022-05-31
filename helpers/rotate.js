window.onload=getExif;
var newimg = document.getElementById('campic');
function getExif() {
    EXIF.getData(newimg, function() {
            var orientation = EXIF.getTag(this, "Orientation");
            if(orientation == 6) {
                newimg.className = "camview rotate90";
            } else if(orientation == 8) {
                newimg.className = "camview rotate270";
            } else if(orientation == 3) {
                newimg.className = "camview rotate180";
            }
        });
};