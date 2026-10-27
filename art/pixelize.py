import sys
from PIL import Image
from collections import deque
src=Image.open('/mnt/user-data/attachments/466fd74e-e400-5e4a-bf44-9a3a6dbf4d25/5175c7fd-image.png').convert('RGB')
BG=(233,233,235)
def isbg(p): return sum(abs(a-b) for a,b in zip(p,BG))<36
def cut(region):
    im=src.crop(region);w,h=im.size;px=im.load()
    a=Image.new('L',(w,h),255);ap=a.load();seen=set();q=deque()
    for x in range(w):q+=[(x,0),(x,h-1)]
    for y in range(h):q+=[(0,y),(w-1,y)]
    while q:
        x,y=q.popleft()
        if 0<=x<w and 0<=y<h and (x,y) not in seen and isbg(px[x,y]):
            seen.add((x,y));ap[x,y]=0;q+=[(x+1,y),(x-1,y),(x,y+1),(x,y-1)]
    # keep only the largest connected figure
    comp={};best=None
    for sx in range(0,w,3):
        for sy in range(0,h,3):
            if ap[sx,sy] and (sx,sy) not in comp:
                pts=[];st=[(sx,sy)];comp[(sx,sy)]=1
                while st:
                    x,y=st.pop();pts.append((x,y))
                    for nx,ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
                        if 0<=nx<w and 0<=ny<h and ap[nx,ny] and (nx,ny) not in comp:
                            comp[(nx,ny)]=1;st.append((nx,ny))
                if best is None or len(pts)>len(best): best=pts
    a=Image.new('L',(w,h),0);ap=a.load()
    for x,y in best: ap[x,y]=255
    rgba=im.convert('RGBA');rgba.putalpha(a)
    return rgba.crop(a.getbbox())
def pixelize(rgba,H,colors=32):
    w,h=rgba.size;W=round(w*H/h)
    small=rgba.resize((W,H),Image.BOX)
    alpha=small.getchannel('A').point(lambda v:255 if v>110 else 0)
    rgb=small.convert('RGB')
    q=rgb.quantize(colors=colors,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
    out=q.convert('RGBA');out.putalpha(alpha)
    return out
H=int(sys.argv[1])
for name,reg in [('male',(215,25,705,1095)),('female',(700,25,1118,1095))]:
    sp=pixelize(cut(reg),H)
    print(name,sp.size)
    sp.save(f'{name}_px.png')
    sp.resize((sp.width*4,sp.height*4),Image.NEAREST).save(f'{name}@4x.png')
m=Image.open('male@4x.png');f=Image.open('female@4x.png')
prev=Image.new('RGBA',(m.width+f.width+40,max(m.height,f.height)),(234,243,248,255))
prev.alpha_composite(m,(0,0));prev.alpha_composite(f,(m.width+40,0));prev.save('big_preview.png')
