<?php
class database {
    
    protected $link;
    var $db;
    var $dbType;
	
	private function getTables() {
    if ($this->pdo) {
      $result = array();
      $sql = "";
      switch ($this->getDbType()) {
        case "isql":
          $sql = "SELECT rdb$relation_name as table_name
                  FROM rdb$relations
                  WHERE rdb$view_blr is null
                  AND (rdb$system_flag is null or rdb$system_flag = 0)";
          break;
        default:
          $sql = "SELECT table_name
                  FROM information_schema.tables
                  WHERE table_type = 'BASE TABLE'";
          break;
      }
      $tab = $this->query($sql);
      foreach ($tab as $table)
        $result = ($this->getDbType()=="isql") ? $item["TABLE_NAME"]:$item["table_name"];
      
      return $result;
    }
    else return false;
  }
	private function getFieldDefinitions($table) {
		if ($this->pdo) {
		  $sql = "";
		  switch ($this->getDbType()) {
			case "mysql":
			  $sql = "SELECT DISTINCT
							  column_name,
							  data_type,
							  CASE is_nullable 
								WHEN 'YES' THEN 'NO'
								ELSE 'YES'
							  END CASE as required
					  FROM information_schema.columns 
					  WHERE table_name=':table'";
			  break;
			  case "psql":
			  $sql = "SELECT 
							  g.column_name,
							  g.data_type,
							  g.character_maximum_length,
							  g.udt_name,
							  CASE  
								WHEN is_nullable = 'YES' THEN 'NO'
								ELSE 'YES'
							  END as required
					  FROM information_schema.columns as g 
					  WHERE table_name = ':table'";
			  break;
			case "isql":
			  $sql = 'SELECT  r.RDB$FIELD_NAME AS column_name,
							  r.RDB$DESCRIPTION AS field_description,
							  r.RDB$DEFAULT_VALUE AS field_default_value,
							  CASE r.RDB$NULL_FLAG
								WHEN NULL THEN 'NO'
								ELSE 'YES'
							  END AS required,
							  f.RDB$FIELD_LENGTH AS character_maximum_length,
							  f.RDB$FIELD_PRECISION AS field_precision,
							  f.RDB$FIELD_SCALE AS field_scale,
							  CASE f.RDB$FIELD_TYPE'."
								WHEN 261 THEN 'BLOB'
								WHEN 14 THEN 'CHAR'
								WHEN 40 THEN 'CSTRING'
								WHEN 11 THEN 'D_FLOAT'
								WHEN 27 THEN 'DOUBLE'
								WHEN 10 THEN 'FLOAT'
								WHEN 16 THEN 'INT64'
								WHEN 8 THEN 'INTEGER'
								WHEN 9 THEN 'QUAD'
								WHEN 7 THEN 'SMALLINT'
								WHEN 12 THEN 'DATE'
								WHEN 13 THEN 'TIME'
								WHEN 35 THEN 'TIMESTAMP'
								WHEN 37 THEN 'VARCHAR'
								ELSE 'UNKNOWN'
							  END AS data_type,".'
							  f.RDB$FIELD_SUB_TYPE AS field_subtype,
							  coll.RDB$COLLATION_NAME AS field_collation,
							  cset.RDB$CHARACTER_SET_NAME AS field_charset
					  FROM RDB$RELATION_FIELDS r
					  LEFT JOIN RDB$FIELDS f ON r.RDB$FIELD_SOURCE = f.RDB$FIELD_NAME
					  LEFT JOIN RDB$COLLATIONS coll ON f.RDB$COLLATION_ID = coll.RDB$COLLATION_ID
					  LEFT JOIN RDB$CHARACTER_SETS cset ON f.RDB$CHARACTER_SET_ID = cset.RDB$CHARACTER_SET_ID
					  WHERE r.RDB$RELATION_NAME=':table'
					  ORDER BY r.RDB$FIELD_POSITION;';
			  break;
			case "mssql":
			  $sql = "SELECT  column_name,
							  data_type,
							  CHARacter_maximum_length 'character_maximum_length',
							  CASE is_nullable
								WHEN 'YES' THEN 'NO'
								ELSE 'YES'
							  END as required
					  FROM information_schema.columns
					  WHERE table_name = ':table'";
					  break;
		  }
		  if ($sql) {
			$tab = $this->query($sql,array(':table'=>$table))
		  
			// Get the column usage
			for ($i=0;$i<count($tab);$i++) 
			  $tab[$i]["column_usage"] = $this->getColumnUsage($table,$tab[$i]["column_name"]);
			return $tab;
		  }
		  else return false;
		}
		else return false;
	}
	private function getColumnUsage($table,$field) {
		if ($this->pdo) {
		  $sql = "";
		  switch ($this->getDbType()) {
			case "mysql":
			  $sql = "SELECT	TABLE_NAME as source_table,
							  COLUMN_NAME as source_column,
							  CONSTRAINT_NAME as constraint_name, 
							  REFERENCED_TABLE_NAME as referenced_table,
							  REFERENCED_COLUMN_NAME as referenced_column
					  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
					  WHERE (TABLE_NAME = ':table' AND COLUMN_NAME = ':field') OR
							(REFERENCED_TABLE_NAME = ':table' AND REFERENCED_COLUMN_NAME = ':field')";
			  break;
			case "psql":
			  $sql = "SELECT	constraint_name,
							  source_table,
							  source_column,
							  target_table as referenced_table,
							  target_column as referenced_column
					  FROM (
						SELECT
								o.conname AS constraint_name,
								(SELECT nspname FROM pg_namespace WHERE oid=m.relnamespace) AS source_schema,
								m.relname AS source_table,
								(SELECT a.attname FROM pg_attribute a WHERE a.attrelid = m.oid AND a.attnum = o.conkey[1] AND a.attisdropped = false) AS source_column,
								(SELECT nspname FROM pg_namespace WHERE oid=f.relnamespace) AS target_schema,
								f.relname AS target_table,
								(SELECT a.attname FROM pg_attribute a WHERE a.attrelid = f.oid AND a.attnum = o.confkey[1] AND a.attisdropped = false) AS target_column
						FROM pg_constraint o 
						LEFT JOIN pg_class c ON c.oid = o.conrelid
						LEFT JOIN pg_class f ON f.oid = o.confrelid 
						LEFT JOIN pg_class m ON m.oid = o.conrelid
						WHERE	o.contype = 'f' 
						  AND o.conrelid IN (SELECT oid FROM pg_class c WHERE c.relkind = 'r')
					  ) as m
					  WHERE	(source_table = ':table' AND source_column = ':field') OR 
							(referenced_table = ':table' AND referenced_column = ':field')";
			  break;
			case "isql":
			  $sql = "SELECT  detail_relation_constraints.RDB$CONSTRAINT_NAME as constraint_name,
							  detail_relation_constraints.RDB$RELATION_NAME as source_table,
							  detail_index_segments.RDB$FIELD_NAME as source_column,
							  master_relation_constraints.RDB$RELATION_NAME as referenced_table,
							  master_index_segments.RDB$FIELD_NAME as referenced_column
					  
					  FROM
					  rdb$relation_constraints detail_relation_constraints
					  JOIN rdb$index_segments detail_index_segments ON detail_relation_constraints.rdb$index_name = detail_index_segments.rdb$index_name 
					  JOIN rdb$ref_constraints ON detail_relation_constraints.rdb$constraint_name = rdb$ref_constraints.rdb$constraint_name -- Master indeksas
					  JOIN rdb$relation_constraints master_relation_constraints ON rdb$ref_constraints.rdb$const_name_uq = master_relation_constraints.rdb$constraint_name
					  JOIN rdb$index_segments master_index_segments ON master_relation_constraints.rdb$index_name = master_index_segments.rdb$index_name 
					  
					  WHERE detail_relation_constraints.rdb$constraint_type = 'FOREIGN KEY'
						AND (
						  (detail_relation_constraints.RDB$RELATION_NAME = ':table' AND detail_index_segments.RDB$FIELD_NAME = ':field') OR 
						  (master_relation_constraints.RDB$RELATION_NAME = ':table' AND master_index_segments.RDB$FIELD_NAME = ':field')
						)";
			  break;
			case "mssql":
			  $sql = "SELECT  
							  KCU1.CONSTRAINT_NAME AS constraint_name, 
							  KCU1.TABLE_NAME AS source_table, 
							  KCU1.COLUMN_NAME AS source_column, 
							  KCU1.ORDINAL_POSITION AS ORDINAL_POSITION, 
							  KCU2.CONSTRAINT_NAME AS REFERENCED_CONSTRAINT_NAME, 
							  KCU2.TABLE_NAME AS referenced_table,
							  KCU2.COLUMN_NAME AS referenced_column, 
							  KCU2.ORDINAL_POSITION AS REFERENCED_ORDINAL_POSITION 
							  
					  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS RC 
					  
					  INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU1 
					  ON KCU1.CONSTRAINT_CATALOG = RC.CONSTRAINT_CATALOG  
					  AND KCU1.CONSTRAINT_SCHEMA = RC.CONSTRAINT_SCHEMA 
					  AND KCU1.CONSTRAINT_NAME = RC.CONSTRAINT_NAME 
					  
					  INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU2 
					  ON KCU2.CONSTRAINT_CATALOG = RC.UNIQUE_CONSTRAINT_CATALOG  
					  AND KCU2.CONSTRAINT_SCHEMA = RC.UNIQUE_CONSTRAINT_SCHEMA 
					  AND KCU2.CONSTRAINT_NAME = RC.UNIQUE_CONSTRAINT_NAME 
					  AND KCU2.ORDINAL_POSITION = KCU1.ORDINAL_POSITION
					  
					  WHERE (KCU1.TABLE_NAME = ':table' AND KCU1.COLUMN_NAME = ':field') OR
							(KCU2.TABLE_NAME = ':table' AND KCU2.COLUMN_NAME = ':field')";
			  break;
		  }
		  if ($sql) {
			$tab = $this->query($sql,array(':table'=>$table,':field'=>$field));
			
			return $tab;
		  }
		  else return false;
		}
		else return false;
	}
     
    public function __construct($options=array()) {
        $this->initialize($options);
    }
    public function __destruct() {
        // commenting out to refer to:
        // https://bugs.php.net/bug.php?id=30525
        //$this->close();
    }
    
    public function connect($options) {
    try {
		$type = $this->getDbType();
		if ($type == "psql") $type = "pgsql";
		if ($type == "isql") $type = "firebird";

		$dsn = "$type:host=".$options["SERVER"].";port=".$options["PORT"].";dbname=".$options["NAME"];
		$pdo = new PDO($dsn,$options["USER"],$options["PASS"]);
		$this->link = $pdo;
	}
	catch (Exception $ex) {
		$this->link = false;
		echo $ex->getMessage();
    }
    return $this->link;
  }
    public function close() {
        if ($this->link) {
            switch ($this->getDbType()) {
                case "mysql":
                    mysql_close($this->link);
                    break;
                case "psql":
                    pg_close($this->link);
                    break;
            }
            return true;
        }
        return false;
    }
    
    public function initialize($options) {
        if (!count($options)) {
            $options = array("TYPE"=>DB_TYPE,"SERVER"=>DB_SERVER,"NAME"=>DB_NAME,"USER"=>DB_USER,"PASS"=>DB_PASS,"PORT"=>DB_PORT);
            $this->setDbType(DB_TYPE);
        }
        else {
            $this->setDbType($options["TYPE"]);
        }
        $this->link = $this->connect($options);
    }
    public function query($sql,$params=array()) {
		if ($this->pdo) {
			// Prepare statement
			$stmt = $this->pdo->prepare($sql);
			foreach ($params as $k=>$v) $stmt->bindParam($k,$v);
			$res  = $stmt->execute();
			$tab  = $stmt->fetchAll();
			return $tab;
		}
		else return false;
	}
    public function getLastError() {
        $error = "";
        if ($this->link) {
            switch ($this->getDbType()) {
                case "mysql":
                    
                    break;
                case "psql":
                    
                    break;
                case "mssql":
                    $error = mssql_get_last_message();
                    break;
                case "isql":
                    // ?
                    break;
            }
            return $error;
        }
        else return false;
    }
    public function getNumRows($res) {
        if (($res) && (!empty($res))) {
            switch ($this->getDbType()) {
                case "mysql":
                    return mysql_num_rows($res);
                    break;
                case "psql":
                    return pg_num_rows($res);
                    break;
                case "isql":
                    //return ibase_affected_rows($this->link);
                    $tab = $this->getTable($res);
                    $num = count($tab);
                    return $num;
                    break;
                case "mssql":
                    return mssql_num_rows($res);
                    break;
            }
        }
        else return false;
    }
    public function getTable($res) {
        if ($res) {
            $result = array();
            $count = 0;
            switch ($this->getDbType()) {
                case "mysql":
                    while ($row = mysql_fetch_assoc($res)) {
                        foreach ($row as $field=>$value) {
                            $result[$count][$field] = $value;
                        }
                        $count++;
                    }
                    break;
                case "psql":
                    while ($row = pg_fetch_assoc($res)) {
                        foreach ($row as $field=>$value) {
                            $result[$count][$field] = $value;
                        }
                        $count++;
                    }
                    break;
                case "isql":
                    while ($row = ibase_fetch_assoc($res)) {
                        foreach ($row as $field=>$value) {
                            $result[$count][$field] = $value;
                        }
                        $count++;
                    }
                    break;
                case "mssql":
                    while ($row = mssql_fetch_assoc($res)) {
                        foreach ($row as $field=>$value) {
                            $result[$count][$field] = $value;
                        }
                        $count++;
                    }
            }
            return $result;
        }
        else return false;
    }
    public function getLastId($table="") {
        if ($this->link) {
            $id = 0;
            switch ($this->getDbType()) {
                case "mysql":
                    $id = mysql_insert_id($this->link);
                    break;
                case "psql":
                    $table = $table."_id_seq";
                    $sql = "SELECT last_value FROM $table";
                    $res = $this->query($sql);
                    $tab = $this->getTable($res);
                    $id = (int)$tab[0]["last_value"];
                    break;
                case "mssql":
                    $sql = "SELECT SCOPE_IDENTITY() AS last_value";
                    $res = $this->query($sql);
                    $tab = $this->getTable($res);
                    $id = (int)$tab[0]["last_value"];
                    break;
                case "isql":
                    // ?
                    break;
            }
            return $id;
        }
        else return false;
    }
	public function pg_getLastId($table) {
        $table = $table."_id_seq";
        $sql = "SELECT last_value FROM $table";
        $res = $this->query($sql);
        $tab = $this->getTable($res);
        $id = (int)$tab[0]["last_value"];
        
        return $id;
    }
    
	public function put($table,$id=0) {
    $fields     = array();
    $values     = array();
    $dtypes     = array();
    $dbTables   = $this->getTables();
    $dbFields   = $this->getFieldDefinitions($table);
    $id         = (is_numeric($id)) ? (int)$id:0;
    if (in_array($table,$dbTables)) {
      if ($id)    $sql = "UPDATE $table SET ";
      else        $sql = "INSERT INTO $table ";
      
      // Ensure all required values are met
      foreach ($dbFields as $a) 
        if  (($dbFields[$a]["required"]=="YES") && ((!isset($_POST[$dbFields[$a]["column_name"])) || (empty($_POST[$dbFields[$a]["column_name"]))))
          throw new Exception('Value for '.$dbFields[$a]["column_name"].' is required.');
      
      // Discover values
      foreach ($dbFields as $a) {
        if ((isset($_POST[$a["column_name"]])) && (!empty($_POST[$a["column_name"]]))) {
          $fields[] = $a;
          $values[] = $_POST[$a];
          $dtypes[] = $a["data_type"];
        }
      }
      
      // Construct rest of query
      if (($id) && ($dbFields)) {
        for ($index=0;$index<count($fields);$index++) {
          if ($index) $sql .= ", ";
          $sql .= $fields[$index]." = ?";
        }
        $sql .= " WHERE id = $id";
      }
      else if ($dbFields) {
        $v = str_repeat("?,", count($fields));
        $sql .= "(".implode(",",$fields).") VALUES (".  substr($v, 0, (strlen($v)-1));
      }
      
      // Bind Values
      $params = arary();
      for ($index=0;$index<count($fields);$index++) {
        $v = (strpos($dtypes[$index],"INT")!==false) ? (int)$values[$index]:$values[$index];
        $params[] = array(($index+1),$v);
      }
      
      // Execute
      $this->query($sql,$params);
      return ($id) ? $id:$this->pdo->lastInsertId();
    }
    else throw new Exception('Table $table does not exist!');
  }
	public function get($table,$id=0) {
    $values   = array();
    $id       = (int)$id;
    $dbTables = $this->getTables();
    if (!in_array($table,$dbTables)) throw new Exception('Table $table does not exist!');
    $dbFields = $this->getFieldDefinitions($table);
    if ((is_numeric($id)) && ($id) && ($dbFields)) {
      $sql = "SELECT * FROM $table WHERE id = $id ";
  	
  	// Column usage?
  	foreach ($dbFields as $d)
  		foreach ($d["column_usage"] as $u) {
  			$jtable = $u["referenced_table"];
  			$jfield = $u["referenced_column"];
  			$sql .= "LEFT JOIN $jtable ON $jtable.$field = $table.".$d["column_name"]." ";
  		}
  			
  	
      $tab  = $this->query($sql)
      if (isset($tab[0])) {
        foreach ($tab[0] as $k=>$v) $values[$k] = $v;
      }
      else foreach ($dbFields as $f) $values[$f["column_name"]] = "";
    }
    else foreach ($dbFields as $f) $values[$f["column_name"]] = "";
    return $values;
  }

	
    public function getLinkResult() {
        return $this->link;
    }
    public function getDbType() {
        return $this->dbType;
    }
    public function setDbType($value) {
        $this->dbType = $value;
    }
}