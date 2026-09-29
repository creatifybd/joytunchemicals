"""Alpha-only cutouts; RGB samples and original files remain unchanged."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage as ndi
ROOT=Path(__file__).resolve().parents[1]
NAMES=['vix-orange-bar','vix-lemon-bar','mr-glasso-spray','mr-glasso-refill','t-flush-toilet-cleaner']
manifest=[];previews=[]
for name in NAMES:
 source=ROOT/'public/images/products'/f'{name}.png'
 im=Image.open(source).convert('RGBA');rgb=np.array(im)[:,:,:3];h,w=rgb.shape[:2]
 spread=rgb.max(2).astype(float)-rgb.min(2)
 mask=(spread>22)&(rgb.min(2)<240)
 # Clear plastic boundaries must join the colored bottle silhouette.
 if name=='mr-glasso-spray':
  mask[120:310,555:847]|=rgb[120:310,555:847].min(2)<245
  mask[287:355,625:803]|=rgb[287:355,625:803].min(2)<245
 if name=='mr-glasso-refill':
  mask[154:236,592:804]|=rgb[154:236,592:804].min(2)<245
 labels,n=ndi.label(mask);sizes=np.bincount(labels.ravel());sizes[0]=0
 mask=labels==sizes.argmax()
 mask=ndi.binary_fill_holes(mask)
 # Subpixel-width softened edge only; no RGB resampling or recoloring.
 alpha=np.clip(ndi.gaussian_filter(mask.astype(float),.55)*255,0,255).astype('uint8')
 alpha[ndi.binary_erosion(mask,iterations=2)]=255
 rgba=np.dstack([rgb,alpha]);out=ROOT/'public/images/products-transparent'/f'{name}.png'
 Image.fromarray(rgba).save(out,optimize=True)
 assert np.array_equal(np.array(Image.open(out))[:,:,:3],rgb)
 manifest.append({'slug':name,'originalSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'rgbSha256':hashlib.sha256(rgb.tobytes()).hexdigest(),'width':w,'height':h})
 preview=Image.new('RGBA',im.size,'#d8d6bd');preview.alpha_composite(Image.fromarray(rgba));preview.thumbnail((400,400));tile=Image.new('RGB',(420,445),'white');tile.paste(preview,(10,30));ImageDraw.Draw(tile).text((10,10),name,fill='black');previews.append(tile)
(ROOT/'src/data/product-cutouts.json').write_text(json.dumps(manifest,indent=2)+'\n')
sheet=Image.new('RGB',(420*len(previews),445),'white')
for i,p in enumerate(previews):sheet.paste(p,(420*i,0))
sheet.save('/workspace/scratch/product-cutout-review.jpg')
print(json.dumps(manifest,indent=2))
