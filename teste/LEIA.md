# Teste automático do VB

`node teste/smoke.js` abre o app com um banco falso (`fake.js`) em três larguras e acusa erro de JavaScript.
Nenhum dado real aqui. Teste novo de um assunto entra nesta pasta e fica.

`node teste/fichas_ren.js PASTA [arquivo.html]` fotografa as folhas de ENTRADAS/SAÍDAS em 373, 469, 867 e 1280; `--compara A B` diz o que mudou entre duas pastas; `--estrutura` confere que, com o Duo aberto, cada folha mora dentro da coluna da direita e volta para o corpo ao fechar.

`node teste/tela_descida.js` finge o atalho do iPhone com a altura encolhida (867x587) e confere a cura da tela descida: age na hora, não age com campo em foco, não entra em rajada, guarda a rolagem.

`node teste/folhas_baixo.js PASTA [arquivo.html]` fotografa a ficha do relógio e folhas de baixo criadas na hora; `--estrutura` confere que moram na coluna da direita com o Duo aberto, voltam para o corpo ao fechar e prendem/soltam a esquerda como antes.
