# jpa分页查找

* PageReq
```java
package cn.xiaowenjie.commons.beans;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.util.StringUtils;

public class PageReq {

	private int current = 1;

	private int rowCount = 10;

	private String sortfield = "";

	private String sort = "";

	private String keyword = "";

	public PageReq() {
		super();
	}

	public PageReq(int current, int rowCount, String sortfield, String sort, String keyword) {
		super();
		this.current = current;
		this.rowCount = rowCount;
		this.sortfield = sortfield;
		this.sort = sort;
		this.keyword = keyword;
	}

	public PageReq getPageable() {
		return new PageReq(current, rowCount, sortfield, sort, keyword);
	}

	public Pageable toPageable() {
		// pageable里面是从第0页开始的。
		Pageable pageable = null;

		if (StringUtils.isEmpty(sortfield)) {
			pageable = new PageRequest(current - 1, rowCount);
		} else {
			pageable = new PageRequest(current - 1, rowCount,
					"desc".equalsIgnoreCase(sort) ? Direction.DESC : Direction.ASC, sortfield);
		}

		return pageable;
	}

	@Override
	public String toString() {
		return "PageReq [current=" + current + ", rowCount=" + rowCount + ", sortfield=" + sortfield + ", sort=" + sort
				+ ", keyword=" + keyword + "]";
	}

	public int getCurrent() {
		return current;
	}

	public void setCurrent(int current) {
		this.current = current;
	}

	public int getRowCount() {
		return rowCount;
	}

	public void setRowCount(int rowCount) {
		this.rowCount = rowCount;
	}

	public String getSortfield() {
		return sortfield;
	}

	public void setSortfield(String sortfield) {
		this.sortfield = sortfield;
	}

	public String getSort() {
		return sort;
	}

	public void setSort(String sort) {
		this.sort = sort;
	}

	public String getKeyword() {
		return keyword;
	}

	public void setKeyword(String keyword) {
		this.keyword = keyword;
	}

}

>PageResp
package cn.xiaowenjie.commons.beans;

import java.util.List;

import org.springframework.data.domain.Page;

public class PageResp<T> {
	private List<T> rows;

	private int current;

	private int rowCount;

	private long total;

	public PageResp(Page<T> page) {
		this.rows = page.getContent();
		this.current = page.getNumber() + 1;
		this.rowCount = page.getSize();
		this.total = page.getTotalElements();
	}

	public List<T> getRows() {
		return rows;
	}

	public void setRows(List<T> rows) {
		this.rows = rows;
	}

	public int getCurrent() {
		return current;
	}

	public void setCurrent(int current) {
		this.current = current;
	}

	public int getRowCount() {
		return rowCount;
	}

	public void setRowCount(int rowCount) {
		this.rowCount = rowCount;
	}

	public long getTotal() {
		return total;
	}

	public void setTotal(long total) {
		this.total = total;
	}

}
```

* PagingAndSortingRepository

```java
package cn.xiaowenjie.star.repositorys;

import org.bson.types.ObjectId;
import org.springframework.data.repository.PagingAndSortingRepository;

import cn.xiaowenjie.star.beans.Article;

public interface ArticleRepository extends PagingAndSortingRepository<Article, ObjectId> {

}
```

* Controller

```java
	@ResponseBody
	@RequestMapping(value = "/list")
	public PageResp<Article> list(PageReq param) {
		log.info("list=" + param);
		return new PageResp<Article>(articleRes.findAll(param.toPageable()));
	}
```