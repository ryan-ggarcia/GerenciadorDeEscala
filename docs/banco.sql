-- =====================================================================
--  Gerenciador de Escala — script do banco (PostgreSQL 13+)
--
--  Cria as tabelas e insere dados de exemplo para testar o sistema.
--  Pode ser executado mais de uma vez: apaga e recria tudo.
--
--  Login de teste:  usuário "admin"  /  senha "admin123"
-- =====================================================================

DROP TABLE IF EXISTS escala            CASCADE;
DROP TABLE IF EXISTS indisponibilidade CASCADE;
DROP TABLE IF EXISTS acolito_funcao    CASCADE;
DROP TABLE IF EXISTS missa             CASCADE;
DROP TABLE IF EXISTS funcao            CASCADE;
DROP TABLE IF EXISTS acolito           CASCADE;
DROP TABLE IF EXISTS usuario           CASCADE;

-- ---------------------------------------------------------------------
--  Tabelas
-- ---------------------------------------------------------------------

-- Administradores do sistema. O middleware só libera o usuário de id 1.
CREATE TABLE usuario (
    usu_id    SERIAL PRIMARY KEY,
    usu_nome  VARCHAR(100) NOT NULL UNIQUE,
    usu_senha VARCHAR(100) NOT NULL          -- hash bcrypt
);

CREATE TABLE acolito (
    aco_id     SERIAL PRIMARY KEY,
    aco_nome   VARCHAR(150) NOT NULL,
    aco_status VARCHAR(10)  NOT NULL DEFAULT 'ATIVO'
               CHECK (aco_status IN ('ATIVO', 'INATIVO'))
);

-- Papéis no altar. O sorteador procura pelos nomes:
--   missa comum  -> Missal, Auxiliar
--   missa solene -> Vela 1, Vela 2, Turíbulo, Gaveta, Missal, Auxiliar
CREATE TABLE funcao (
    fun_id        SERIAL PRIMARY KEY,
    fun_nome      VARCHAR(100) NOT NULL,
    fun_descricao VARCHAR(255)
);

CREATE TABLE missa (
    mis_id          SERIAL PRIMARY KEY,
    mis_local       VARCHAR(150) NOT NULL,
    mis_nome        VARCHAR(150) NOT NULL,
    mis_dia         DATE         NOT NULL,
    mis_hora_inicio TIME         NOT NULL,
    mis_hora_final  TIME
);

-- Habilitações: quais funções cada acólito pode exercer.
CREATE TABLE acolito_funcao (
    aco_id      INT     NOT NULL REFERENCES acolito (aco_id) ON DELETE CASCADE,
    fun_id      INT     NOT NULL REFERENCES funcao  (fun_id) ON DELETE CASCADE,
    pode_servir BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (aco_id, fun_id)
);

-- Períodos em que o acólito não pode servir (datas inclusivas).
CREATE TABLE indisponibilidade (
    ind_id          SERIAL PRIMARY KEY,
    aco_id          INT  NOT NULL REFERENCES acolito (aco_id) ON DELETE CASCADE,
    ind_data_inicio DATE NOT NULL,
    ind_data_fim    DATE NOT NULL,
    ind_motivo      VARCHAR(255),
    CHECK (ind_data_fim >= ind_data_inicio)
);

-- Quem serve em qual missa e com qual função.
-- Sem ON DELETE CASCADE em missa: a limpeza de meses passados apaga a escala antes.
CREATE TABLE escala (
    esc_id     SERIAL PRIMARY KEY,
    mis_id     INT NOT NULL REFERENCES missa   (mis_id),
    aco_id     INT NOT NULL REFERENCES acolito (aco_id) ON DELETE CASCADE,
    fun_id     INT NOT NULL REFERENCES funcao  (fun_id) ON DELETE CASCADE,
    esc_status VARCHAR(12) NOT NULL DEFAULT 'CONVOCADO'
               CHECK (esc_status IN ('CONVOCADO', 'CONFIRMADO', 'RECUSADO'))
);

CREATE INDEX idx_escala_missa   ON escala (mis_id);
CREATE INDEX idx_escala_acolito ON escala (aco_id);
CREATE INDEX idx_missa_dia      ON missa (mis_dia);
CREATE INDEX idx_indisp_acolito ON indisponibilidade (aco_id);

-- ---------------------------------------------------------------------
--  Dados de exemplo
-- ---------------------------------------------------------------------

-- Senha "admin123" (bcrypt, 10 rounds). Precisa ficar com usu_id = 1.
INSERT INTO usuario (usu_nome, usu_senha) VALUES
    ('admin', '$2b$10$RwBOeAgP2Dg4OuhFrosFouVqVXMwblBwCamB3BdOqhCjX1epM0Adi');

INSERT INTO funcao (fun_nome, fun_descricao) VALUES
    ('Missal',   'Segura o missal para o celebrante'),
    ('Auxiliar', 'Auxilia no altar e no ofertório'),
    ('Vela 1',   'Tocheiro à direita'),
    ('Vela 2',   'Tocheiro à esquerda'),
    ('Turíbulo', 'Conduz o turíbulo e o incenso'),
    ('Gaveta',   'Carrega a naveta com o incenso');

INSERT INTO acolito (aco_nome, aco_status) VALUES
    ('Ana Beatriz Souza',   'ATIVO'),
    ('Bruno Henrique Lima', 'ATIVO'),
    ('Carla Mendes',        'ATIVO'),
    ('Daniel Rocha',        'ATIVO'),
    ('Eduarda Martins',     'ATIVO'),
    ('Felipe Carvalho',     'ATIVO'),
    ('Gabriel Almeida',     'ATIVO'),
    ('Helena Ribeiro',      'ATIVO'),
    ('Igor Fernandes',      'INATIVO');

-- Todos os acólitos habilitados em todas as funções...
INSERT INTO acolito_funcao (aco_id, fun_id, pode_servir)
SELECT a.aco_id, f.fun_id, TRUE
FROM acolito a CROSS JOIN funcao f;

-- ...exceto alguns que ainda não aprenderam o turíbulo.
UPDATE acolito_funcao SET pode_servir = FALSE
WHERE fun_id = (SELECT fun_id FROM funcao WHERE fun_nome = 'Turíbulo')
  AND aco_id IN (SELECT aco_id FROM acolito
                 WHERE aco_nome IN ('Carla Mendes', 'Gabriel Almeida'));

-- Missas relativas à data de hoje (mês atual e o próximo), para os dados
-- não serem apagados pelo botão "Limpar meses passados".
-- Domingos: missa das 8h e das 19h.
INSERT INTO missa (mis_local, mis_nome, mis_dia, mis_hora_inicio, mis_hora_final)
SELECT 'Igreja Matriz', 'Missa Dominical', d::date, h.ini, h.fim
FROM generate_series(date_trunc('month', CURRENT_DATE),
                     date_trunc('month', CURRENT_DATE) + INTERVAL '2 months' - INTERVAL '1 day',
                     INTERVAL '1 day') AS d
CROSS JOIN (VALUES (TIME '08:00', TIME '09:00'),
                   (TIME '19:00', TIME '20:00')) AS h(ini, fim)
WHERE EXTRACT(DOW FROM d) = 0;

-- Sábados: missa vespertina na capela.
INSERT INTO missa (mis_local, mis_nome, mis_dia, mis_hora_inicio, mis_hora_final)
SELECT 'Capela São José', 'Missa de Sábado', d::date, TIME '17:00', TIME '18:00'
FROM generate_series(date_trunc('month', CURRENT_DATE),
                     date_trunc('month', CURRENT_DATE) + INTERVAL '2 months' - INTERVAL '1 day',
                     INTERVAL '1 day') AS d
WHERE EXTRACT(DOW FROM d) = 6;

-- Uma indisponibilidade no mês que vem, para ver o sorteador pulando o acólito.
INSERT INTO indisponibilidade (aco_id, ind_data_inicio, ind_data_fim, ind_motivo)
SELECT aco_id,
       (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date,
       (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '14 days')::date,
       'Viagem em família'
FROM acolito WHERE aco_nome = 'Daniel Rocha';

-- A tabela escala começa vazia: monte-a pela tela "Sorteador" ou cadastre à mão.
