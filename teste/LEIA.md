# Teste automático do VB

`node teste/smoke.js` abre o app com um banco falso (`fake.js`) em três larguras e acusa erro de JavaScript.
Nenhum dado real aqui. Teste novo de um assunto entra nesta pasta e fica.

`node teste/fichas_ren.js PASTA [arquivo.html]` fotografa as folhas de ENTRADAS/SAÍDAS em 373, 469, 867 e 1280; `--compara A B` diz o que mudou entre duas pastas; `--estrutura` confere que, com o Duo aberto, cada folha mora dentro da coluna da direita e volta para o corpo ao fechar.

`node teste/tela_descida.js` finge o atalho do iPhone com a altura encolhida (867x587) e confere a cura da tela descida: age na hora, não age com campo em foco, não entra em rajada, guarda a rolagem.

`node teste/folhas_baixo.js PASTA [arquivo.html]` fotografa a ficha do relógio e folhas de baixo criadas na hora; `--estrutura` confere que moram na coluna da direita com o Duo aberto, voltam para o corpo ao fechar e prendem/soltam a esquerda como antes.

`node teste/hist_fecha.js PASTA [arquivo.html]` fotografa a operação do Histórico e o Fechamento (sozinhos e com folha de baixo por cima) em 373, 469, 867 e 1280; `--estrutura` confere que moram na coluna da direita com o Duo aberto e voltam para o corpo ao fechar.

`node teste/clip_foto.js PASTA [arquivo.html]` fotografa o panorama do cliente e a foto (com folha de baixo e com aviso) em 373, 469, 867 e 1280; `--estrutura` confere que moram na coluna da direita com o Duo aberto e voltam para o corpo ao fechar.

`node teste/quitar.js [arquivo.html] [PASTA]` confere o QUITAR: botão só nas entradas manuais que são financiamento, vencidas pelo valor de hoje + a vencer descontadas, total e mensagem, só vencidas, LIMPAR; com PASTA fotografa a tela e a foto.

`node teste/busca_estoque.js` confere a busca do Estoque por palavra ("SKY JU" acha "SKY-DWELLER JUBILEE", sem acento, qualquer ordem, "Nada encontrado.").

`node teste/teclado_folha.js` simula o teclado na NOVA PEÇA (1148x807 aberta e 400x800 fechada): na aberta a folha sobe no toque e o campo fica acima do teclado + 60 da barra flutuante; na fechada nada muda.
