import * as HtmlToImg from 'html-to-image'

 
    let config = {
        width: 50,
        height: 50,
        color: 'white',
        drawing: true,
        eraser: false
    }
   
    let events = {
        mousedown: false
    }
    document.querySelector('.select-file').addEventListener('click', function(e) {
        this.value = null;
    })
    document.querySelector('.select-file').addEventListener('change', function(e) {
        let files = e.target.files;
        let f = files[0];
        let reader = new FileReader();

        document.querySelector('.error').classList.remove('active');

        reader.onload = (async function(file) {
            if(file.type == "image/png" || file.type == "image/jpg"  || file.type == "image/jpeg") {
                // Continue
                const bitmap = await createImageBitmap(file);
                const canvas = document.querySelector("canvas");
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                const ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, 9999, 9999);
                ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                let constructPixelData = []
                
                for(let i = 0; i < config.width; ++i) {
                    for(let j = 0; j < config.height; ++j) {
                        let pixelData = canvas.getContext('2d').getImageData(i, j, 1, 1).data;
                     
                        if(pixelData[3] !== 0) {
                            constructPixelData.push({ x: i, y: j, color: `rgb(${pixelData[0]} ${pixelData[1]} ${pixelData[2]})`});
                        }
                    }
                }
                constructPixelData.forEach(function(i) {
                    let getPixel = document.querySelector(`.pixel[data-x-coordinate="${i.x}"][data-y-coordinate="${i.y}"]`);
                    if(getPixel !== null) {
                        getPixel.setAttribute('data-color', i.color);
                        getPixel.style.background = i.color;
                    }
                });
            }
            else {
                document.querySelector('.error').textContent = 'Пожалуйста выберите png/jpg формат файла для загрузки.';
                document.querySelector('.error').classList.add('active');
            }

        })(f);
    });

    document.getElementById('pixel-art-area').style.width = `calc(${(0.825 * config.width)}rem + ${(config.height * 3)}px)`;
    document.getElementById('pixel-art-area').style.height = `calc(${(0.825 * config.height)}rem + ${(config.width * 3)}px)`;
    document.getElementById('pixel-art-options').style.width = `calc(${(0.825 * config.width)}rem + ${(config.height * 3)}px)`;
    
    for(let i = 0; i < config.width; ++i) {
        for(let j = 0; j < config.height; ++j) {
            let createEl = document.createElement('div');
            createEl.classList.add('pixel');
            createEl.setAttribute('data-x-coordinate', j);
            createEl.setAttribute('data-y-coordinate', i);
            document.getElementById('pixel-art-area').appendChild(createEl);
        }
    }
    
    document.querySelectorAll('.pixel').forEach(function(item) {
        item.addEventListener('pointerdown', function(e) {
            if(config.eraser === true) {
                item.setAttribute('data-color', null);
                item.style.background = `#191f2b`;
            } else {
                item.setAttribute('data-color', config.color);
                item.style.background = `${config.color}`;
            }
            events.mousedown = true;
        });
    });
    
    document.getElementById('pixel-art-area').addEventListener('pointermove', function(e) {
        if(config.drawing === true && events.mousedown === true || config.eraser === true && events.mousedown === true) {
            if(e.target.matches('.pixel')) {
                if(config.eraser === true) {
                    e.target.setAttribute('data-color', null);
                    e.target.style.background = `#191f2b`;
                } else {
                    e.target.setAttribute('data-color', config.color);
                    e.target.style.background = `${config.color}`;
                }
            }
        }
    });
    
    document.body.addEventListener('pointerup', function(e) {
        events.mousedown = false;
    });
    
    [ 'click', 'input' ].forEach(function(item) {
        document.querySelector('.color-picker').addEventListener(item, function() {
            document.querySelector('.error').classList.remove('active');
            config.color = this.value;
            document.querySelectorAll('.colors > div').forEach(function(i) {
                i.classList.remove('current');
            });
            this.classList.add('current');
            config.eraser = false;
            document.querySelector('.eraser-container').classList.remove('current');
        });
    });
    
    document.querySelectorAll('.colors > div').forEach(function(item) {
        document.querySelector('.error').classList.remove('active');
        if(item.classList.contains('select-color')) {
            return false;
        }
        else {
            item.addEventListener('click', function(e) {
                document.querySelector('.color-picker').classList.remove('current');
                document.querySelectorAll('.colors > div').forEach(function(i) {
                    i.classList.remove('current');
                })
                item.classList.add('current');
                config.eraser = false;
                config.color = `${item.getAttribute('data-color')}`;
                document.querySelector('.eraser-container').classList.remove('current');
            })
        }
    });
    
    document.querySelector('.reset').addEventListener('click', function(e) {
        document.querySelector('.error').classList.remove('active');
        document.querySelectorAll('.pixel').forEach(function(item) {
            item.setAttribute('data-color', null)
            item.style.background = '#191f2b';
        });
    });
    
    document.querySelector('.prebuilt .prebuilt').addEventListener('click', function(e) {
        document.querySelector('.error').classList.remove('active');
        if(document.querySelector('.prebuilt .options').classList.contains('active')) {
            document.querySelector('.prebuilt .options').classList.remove('active');
        } else {
            document.querySelector('.prebuilt .options').classList.add('active');
        }
    });
    
    document.body.addEventListener('click', function(e) {
        document.querySelector('.error').classList.remove('active');
        if(!e.target.matches('.prebuilt.current')) {
            document.querySelector('.prebuilt .options').classList.remove('active');
        }
    })
    
    document.querySelectorAll('.options > .prebuilt').forEach(function(item) {
        document.querySelector('.error').classList.remove('active');
        item.addEventListener('pointerdown', function(e) {
            let getPrebuilt = item.getAttribute('data-prebuilt');
            document.querySelectorAll('.pixel').forEach(function(item) {
                item.setAttribute('data-color', null)
                item.style.background = '#191f2b';
            });
            if(typeof prebuilt[`${getPrebuilt}`] !== "undefined") {
                prebuilt[`${getPrebuilt}`].forEach(function(i) {
                    let getPixel = document.querySelector(`.pixel[data-x-coordinate="${i.x}"][data-y-coordinate="${i.y}"]`);
                    if(getPixel !== null) {
                        getPixel.setAttribute('data-color', i.color);
                        getPixel.style.background = i.color;
                    }
                });
            }
        });
    });
    
    document.querySelector('.eraser').addEventListener('click', function(e) {
        document.querySelector('.error').classList.remove('active');
        document.querySelectorAll('.colors > div').forEach(function(i) {
                i.classList.remove('current');
        });
        document.querySelector('.color-picker').classList.remove('current');
        if(this.classList.contains('current')) {
            this.parentElement.classList.remove('current');
            document.querySelector('.color > div').classList.add('current');
            config.color = 'white';
            config.eraser = false;
        } else {
            this.parentElement.classList.add('current');
            config.eraser = true;
        }
    });
    
    document.querySelector('.generate-css').addEventListener('click', function(e) {
        document.querySelector('.error').classList.remove('active');
        document.getElementById('popup-pixel-art').innerHTML = `
        <h2>Pixel Art Code</h2>
        <p>Copy the code below to use this on your webpage</p>
        <div class="close"><i class="fal fa-times"></i></div>`;
        
        let boxShadow = 
        `.pixelart {
            width: 1px;
            height: 1px;
            transform: scale(5);
            background: transparent;
            box-shadow: `;
    
        document.querySelectorAll('.pixel').forEach(function(item) {
            if(item.getAttribute('data-color') !== "null" && item.getAttribute('data-color') !== null) {
                let x = item.getAttribute('data-x-coordinate');
                let y = item.getAttribute('data-y-coordinate');
                let color = item.getAttribute('data-color');
    
                boxShadow += `${x}px ${y}px ${color}, `
            }
        });
        boxShadow = boxShadow.slice(0, -2);
        boxShadow = `${boxShadow};
    }`
    
        let boxShadowCode = 
            `
    &lt;<span class="token tag">div</span> <span class="token attr-name">class</span>="<span class="token attr-value">pixelart</span>">&lt;/<span class="token attr-name">div</span>>
    &lt;<span class="token tag">style</span> <span class="token attr-name">type</span>="<span class="token attr-value">text/css</span>">
    <span class="token selector">.pixelart</span> {
        <span class="token property">width</span>: <span class="token number">1</span>px;
        <span class="token property">height</span>: <span class="token number">1</span>px;
        <span class="token property">transform</span>: scale(<span class="token number">20</span>);
        <span class="token property">background</span>: transparent;
        <span class="token property">box-shadow</span>: `;
        
        document.querySelectorAll('.pixel').forEach(function(item) {
            if(item.getAttribute('data-color') !== "null" && item.getAttribute('data-color') !== null) {
                let x = item.getAttribute('data-x-coordinate');
                let y = item.getAttribute('data-y-coordinate');
                let color = item.getAttribute('data-color');
    
                boxShadowCode += `<span class="token number">${x}</span><span class="token unit">px</span> <span class="token number">${y}</span><span class="token unit">px</span> ${color}, `
            }
        });
    
        boxShadowCode = boxShadowCode.slice(0, -2);
        boxShadowCode = `${boxShadowCode};
    }
    &lt;/<span class="token tag">style</span>>`
    
        let newStyle = document.createElement('style');
        newStyle.innerHTML = boxShadow;
        document.body.append(newStyle);
    
        let newPixelArt = document.createElement('div');
        newPixelArt.classList.add('pixelart');

        const div = document.createElement('div');
        div.classList.add('set')
        div.appendChild(newStyle)
        div.appendChild(newPixelArt)

        let d = document.querySelector('.set')
        console.log(d)
        HtmlToImg.toPng(d).then((data) =>{
            console.log(data)
            document.getElementById('popup-pixel-art').append(newPixelArt);
    
            let newCodeBlock = document.createElement('pre')
            newCodeBlock.innerHTML = `<code>${boxShadowCode}</code>`;
            document.getElementById('popup-pixel-art').append(newCodeBlock);
        
            document.getElementById('popup-pixel-art').classList.add('active');
        })

      
     
        
        
    });
    
    document.body.addEventListener('click', function(e) {
        if(!parent(e.target, '#popup-pixel-art', 1).matches('#popup-pixel-art') && !e.target.matches('#popup-pixel-art') && !e.target.matches('.generate-css')  && !e.target.matches('.generate-css-span') || parent(e.target, '.close', 1).matches('.close' || e.target.matches('.close')) ) {
            document.getElementById('popup-pixel-art').classList.remove('active');
        }
    })
    
    const parent = function(el, match, last) {
        var result = [];
        for (var p = el && el.parentElement; p; p = p.parentElement) {
            result.push(p);
            if(p.matches(match)) {
                break;
            }
        }
        if(last == 1) {
            return result[result.length - 1];
        } else {
            return result;
        }
    };